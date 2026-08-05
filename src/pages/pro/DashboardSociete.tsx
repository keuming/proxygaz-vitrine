import { useEffect, useState, useCallback, FormEvent } from "react";
import { trpcQuery, trpcMutation } from "../../lib/api";
import { Card } from "../../components/Card";
import { StatusGauge } from "../../components/StatusGauge";
import { ProHeader } from "../../components/ProHeader";
import { BottomNav } from "../../components/BottomNav";
import { IconeStock, IconeCaisse } from "../../components/NavIcons";
import { CreditIndicator } from "../../components/CreditIndicator";
import { CreditPurchaseModal } from "../../components/CreditPurchaseModal";
import { useAuth } from "../../lib/auth";

interface Livreur {
  id: string;
  nom: string;
  telephone: string;
  vehicule: string | null;
  zonesCouvertes: string[];
  statutValidation: string;
  nombreLivraisons: number;
}

interface StatsSociete {
  nombreLivreurs: number;
  totalLivraisons: number;
  enCoursActuellement: number;
}

const CHAMPS_INITIAUX = {
  nom: "",
  telephone: "",
  codePin: "",
  vehicule: "",
  zonesCouvertes: "",
};

export function DashboardSociete() {
  const { user } = useAuth();
  const [onglet, setOnglet] = useState<"livreurs" | "credits">("livreurs");
  const [nomSociete, setNomSociete] = useState<string | null>(null);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [stats, setStats] = useState<StatsSociete | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [achatOuvert, setAchatOuvert] = useState(false);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [champs, setChamps] = useState(CHAMPS_INITIAUX);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerProfil = useCallback(() => {
    trpcQuery<{ nomSociete: string }>("gaz.monProfilSociete")
      .then((r) => setNomSociete(r.nomSociete))
      .catch(() => {});
  }, []);

  const chargerLivreurs = useCallback(() => {
    trpcQuery<Livreur[]>("gaz.mesLivreursSociete").then(setLivreurs).catch((e) => setErreur(e.message));
  }, []);

  const chargerStats = useCallback(() => {
    trpcQuery<StatsSociete>("gaz.statsSociete").then(setStats).catch(() => {});
  }, []);

  const chargerCredits = useCallback(() => {
    trpcQuery<{ credits: number }>("gaz.monCreditSociete")
      .then((r) => setCredits(r.credits))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chargerProfil();
    chargerLivreurs();
    chargerStats();
    chargerCredits();
  }, [chargerProfil, chargerLivreurs, chargerStats, chargerCredits]);

  async function ajouterLivreur(e: FormEvent) {
    e.preventDefault();
    setAjoutEnCours(true);
    setErreur(null);
    try {
      await trpcMutation("gaz.ajouterLivreurSousSociete", {
        nom: champs.nom,
        telephone: champs.telephone,
        codePin: champs.codePin,
        vehicule: champs.vehicule || undefined,
        zonesCouvertes: champs.zonesCouvertes.split(",").map((z) => z.trim()).filter(Boolean),
      });
      setAjoutOuvert(false);
      setChamps(CHAMPS_INITIAUX);
      chargerLivreurs();
      chargerStats();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'ajout du livreur");
    } finally {
      setAjoutEnCours(false);
    }
  }

  async function demanderCredit(quantite: number, referencePaiement: string) {
    await trpcMutation("gaz.demanderCreditSociete", { quantiteCredits: quantite, referencePaiement });
  }

  const NAV_ITEMS = [
    { value: "livreurs" as const, label: "Mes livreurs", icon: <IconeStock /> },
    { value: "credits" as const, label: "Crédits", icon: <IconeCaisse /> },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <ProHeader titre={nomSociete ?? "Espace société"} sousTitre="Gestion de vos livreurs" />

      <div className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-8">
          {stats && (
            <div className="mb-5 grid grid-cols-3 gap-2.5">
              <Card className="p-3">
                <div className="font-data text-lg font-bold text-ink">{stats.nombreLivreurs}</div>
                <div className="text-xs text-ink/50">Livreurs</div>
              </Card>
              <Card className="p-3">
                <div className="font-data text-lg font-bold text-gaz-600">{stats.totalLivraisons}</div>
                <div className="text-xs text-ink/50">Livraisons</div>
              </Card>
              <Card className="p-3">
                <div className="font-data text-lg font-bold text-safety-500">{stats.enCoursActuellement}</div>
                <div className="text-xs text-ink/50">En cours</div>
              </Card>
            </div>
          )}

          {erreur && (
            <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
          )}

          {onglet === "livreurs" ? (
            <div>
              <button
                onClick={() => setAjoutOuvert(true)}
                className="mb-4 w-full rounded-md bg-steel-500 py-2.5 text-sm font-semibold text-white hover:bg-steel-600"
              >
                + Ajouter un livreur
              </button>

              {livreurs.length === 0 ? (
                <p className="text-sm text-ink/40">
                  Aucun livreur pour l'instant. Ajoutez votre premier livreur ci-dessus.
                </p>
              ) : (
                <div className="space-y-3">
                  {livreurs.map((l) => (
                    <Card key={l.id} className="p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="text-sm font-medium text-ink">{l.nom}</div>
                        <StatusGauge statut={l.statutValidation} />
                      </div>
                      <div className="font-data text-xs text-ink/50">{l.telephone}</div>
                      <div className="mt-2 flex items-center justify-between text-xs text-ink/50">
                        <span>{l.vehicule ?? "Véhicule non précisé"}</span>
                        <span className="font-data font-medium text-ink">
                          {l.nombreLivraisons} livraison{l.nombreLivraisons !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {credits !== null && (
                <div className="mb-5">
                  <CreditIndicator credits={credits} onAcheter={() => setAchatOuvert(true)} />
                </div>
              )}
              <p className="text-xs text-ink/40">
                Ce solde est un pot commun, partagé par tous vos livreurs. Chaque livraison
                acceptée par l'un d'eux débite ce pot commun de 1 crédit (100 FCFA).
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav items={NAV_ITEMS} actif={onglet} onChange={(v) => setOnglet(v as "livreurs" | "credits")} />

      {ajoutOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm animate-overlay-in">
          <div className="w-full max-w-sm animate-modal-pop rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Ajouter un livreur</h2>
              <button onClick={() => setAjoutOuvert(false)} className="text-ink/30 hover:text-ink/60">
                ✕
              </button>
            </div>
            <form onSubmit={ajouterLivreur}>
              <label className="mb-1 block text-xs font-medium text-ink/60">Nom</label>
              <input
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champs.nom}
                onChange={(e) => setChamps({ ...champs, nom: e.target.value })}
                required
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">
                Téléphone (identifiant de connexion)
              </label>
              <input
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champs.telephone}
                onChange={(e) => setChamps({ ...champs, telephone: e.target.value })}
                required
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">
                Code PIN (4 chiffres) — servira à sa connexion
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-center text-sm tracking-[0.5em] focus:border-steel-500"
                value={champs.codePin}
                onChange={(e) =>
                  setChamps({ ...champs, codePin: e.target.value.replace(/\D/g, "").slice(0, 4) })
                }
                required
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">Véhicule</label>
              <input
                placeholder="moto, tricycle..."
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champs.vehicule}
                onChange={(e) => setChamps({ ...champs, vehicule: e.target.value })}
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">
                Zones couvertes (séparées par des virgules)
              </label>
              <input
                placeholder="Cocody, Marcory, Yopougon"
                className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champs.zonesCouvertes}
                onChange={(e) => setChamps({ ...champs, zonesCouvertes: e.target.value })}
                required
              />
              <button
                type="submit"
                disabled={ajoutEnCours}
                className="w-full rounded-md bg-steel-500 py-2.5 text-sm font-semibold text-white hover:bg-steel-600 disabled:opacity-60"
              >
                {ajoutEnCours ? "Ajout..." : "Ajouter ce livreur"}
              </button>
            </form>
          </div>
        </div>
      )}

      {achatOuvert && (
        <CreditPurchaseModal
          nomSuggere={user?.nom ?? ""}
          telephoneSuggere=""
          onDemander={demanderCredit}
          onFermer={() => {
            setAchatOuvert(false);
            chargerCredits();
          }}
        />
      )}
    </div>
  );
}
