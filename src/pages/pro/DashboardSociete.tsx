import { useEffect, useState, useCallback, FormEvent } from "react";
import { trpcQuery, trpcMutation } from "../../lib/api";
import { Card } from "../../components/Card";
import { StatusGauge } from "../../components/StatusGauge";
import { ProHeader } from "../../components/ProHeader";
import { BottomNav } from "../../components/BottomNav";
import { IconeStock, IconeBoutique, IconeCaisse } from "../../components/NavIcons";
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

interface Boutique {
  id: string;
  nomBoutique: string;
  adresse: string | null;
  statutValidation: string;
  createdAt: string;
}

interface StatsSociete {
  nombreLivreurs: number;
  nombreBoutiques: number;
  totalLivraisons: number;
  enCoursActuellement: number;
}

const CHAMPS_LIVREUR_INITIAUX = {
  nom: "",
  telephone: "",
  codePin: "",
  vehicule: "",
  zonesCouvertes: "",
};

const CHAMPS_BOUTIQUE_INITIAUX = {
  nomBoutique: "",
  telephone: "",
  codePin: "",
  adresse: "",
};

export function DashboardSociete() {
  const { user } = useAuth();
  const [onglet, setOnglet] = useState<"livreurs" | "boutiques" | "credits">("livreurs");
  const [nomSociete, setNomSociete] = useState<string | null>(null);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [stats, setStats] = useState<StatsSociete | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [achatOuvert, setAchatOuvert] = useState(false);
  const [ajoutLivreurOuvert, setAjoutLivreurOuvert] = useState(false);
  const [ajoutBoutiqueOuvert, setAjoutBoutiqueOuvert] = useState(false);
  const [champsLivreur, setChampsLivreur] = useState(CHAMPS_LIVREUR_INITIAUX);
  const [champsBoutique, setChampsBoutique] = useState(CHAMPS_BOUTIQUE_INITIAUX);
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

  const chargerBoutiques = useCallback(() => {
    trpcQuery<Boutique[]>("gaz.mesBoutiquesSociete").then(setBoutiques).catch((e) => setErreur(e.message));
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
    chargerBoutiques();
    chargerStats();
    chargerCredits();
  }, [chargerProfil, chargerLivreurs, chargerBoutiques, chargerStats, chargerCredits]);

  async function ajouterLivreur(e: FormEvent) {
    e.preventDefault();
    setAjoutEnCours(true);
    setErreur(null);
    try {
      await trpcMutation("gaz.ajouterLivreurSousSociete", {
        nom: champsLivreur.nom,
        telephone: champsLivreur.telephone,
        codePin: champsLivreur.codePin,
        vehicule: champsLivreur.vehicule || undefined,
        zonesCouvertes: champsLivreur.zonesCouvertes.split(",").map((z) => z.trim()).filter(Boolean),
      });
      setAjoutLivreurOuvert(false);
      setChampsLivreur(CHAMPS_LIVREUR_INITIAUX);
      chargerLivreurs();
      chargerStats();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'ajout du livreur");
    } finally {
      setAjoutEnCours(false);
    }
  }

  async function ajouterBoutique(e: FormEvent) {
    e.preventDefault();
    setAjoutEnCours(true);
    setErreur(null);
    try {
      await trpcMutation("gaz.ajouterBoutiqueSousSociete", {
        nomBoutique: champsBoutique.nomBoutique,
        telephone: champsBoutique.telephone,
        codePin: champsBoutique.codePin,
        adresse: champsBoutique.adresse || undefined,
      });
      setAjoutBoutiqueOuvert(false);
      setChampsBoutique(CHAMPS_BOUTIQUE_INITIAUX);
      chargerBoutiques();
      chargerStats();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'ajout de la boutique");
    } finally {
      setAjoutEnCours(false);
    }
  }

  async function demanderCredit(quantite: number, referencePaiement: string) {
    await trpcMutation("gaz.demanderCreditSociete", { quantiteCredits: quantite, referencePaiement });
  }

  const NAV_ITEMS = [
    { value: "livreurs" as const, label: "Livreurs", icon: <IconeStock /> },
    { value: "boutiques" as const, label: "Boutiques", icon: <IconeBoutique /> },
    { value: "credits" as const, label: "Crédits", icon: <IconeCaisse /> },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <ProHeader titre={nomSociete ?? "Espace société"} sousTitre="Gestion de vos livreurs et boutiques" />

      <div className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-8">
          {stats && (
            <div className="mb-5 grid grid-cols-4 gap-2">
              <Card className="p-3">
                <div className="font-data text-lg font-bold text-ink">{stats.nombreLivreurs}</div>
                <div className="text-xs text-ink/50">Livreurs</div>
              </Card>
              <Card className="p-3">
                <div className="font-data text-lg font-bold text-ink">{stats.nombreBoutiques}</div>
                <div className="text-xs text-ink/50">Boutiques</div>
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

          {onglet === "livreurs" && (
            <div>
              <button
                onClick={() => setAjoutLivreurOuvert(true)}
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
          )}

          {onglet === "boutiques" && (
            <div>
              <button
                onClick={() => setAjoutBoutiqueOuvert(true)}
                className="mb-4 w-full rounded-md bg-steel-500 py-2.5 text-sm font-semibold text-white hover:bg-steel-600"
              >
                + Ajouter une boutique
              </button>

              {boutiques.length === 0 ? (
                <p className="text-sm text-ink/40">
                  Aucune boutique pour l'instant. Ajoutez votre première boutique ci-dessus.
                </p>
              ) : (
                <div className="space-y-3">
                  {boutiques.map((b) => (
                    <Card key={b.id} className="p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="text-sm font-medium text-ink">{b.nomBoutique}</div>
                        <StatusGauge statut={b.statutValidation} />
                      </div>
                      <div className="text-xs text-ink/50">{b.adresse ?? "Adresse non précisée"}</div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {onglet === "credits" && (
            <div>
              {credits !== null && (
                <div className="mb-5">
                  <CreditIndicator credits={credits} onAcheter={() => setAchatOuvert(true)} />
                </div>
              )}
              <p className="text-xs text-ink/40">
                Ce solde est un pot commun, partagé par tous vos livreurs et vos boutiques.
                Chaque livraison acceptée par un livreur, ainsi que chaque commande assignée
                à une boutique, débite ce pot commun de 1 crédit (100 FCFA).
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav
        items={NAV_ITEMS}
        actif={onglet}
        onChange={(v) => setOnglet(v as "livreurs" | "boutiques" | "credits")}
      />

      {ajoutLivreurOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm animate-overlay-in">
          <div className="w-full max-w-sm animate-modal-pop rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Ajouter un livreur</h2>
              <button onClick={() => setAjoutLivreurOuvert(false)} className="text-ink/30 hover:text-ink/60">
                ✕
              </button>
            </div>
            <form onSubmit={ajouterLivreur}>
              <label className="mb-1 block text-xs font-medium text-ink/60">Nom</label>
              <input
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champsLivreur.nom}
                onChange={(e) => setChampsLivreur({ ...champsLivreur, nom: e.target.value })}
                required
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">
                Téléphone (identifiant de connexion)
              </label>
              <input
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champsLivreur.telephone}
                onChange={(e) => setChampsLivreur({ ...champsLivreur, telephone: e.target.value })}
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
                value={champsLivreur.codePin}
                onChange={(e) =>
                  setChampsLivreur({ ...champsLivreur, codePin: e.target.value.replace(/\D/g, "").slice(0, 4) })
                }
                required
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">Véhicule</label>
              <input
                placeholder="moto, tricycle..."
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champsLivreur.vehicule}
                onChange={(e) => setChampsLivreur({ ...champsLivreur, vehicule: e.target.value })}
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">
                Zones couvertes (séparées par des virgules)
              </label>
              <input
                placeholder="Cocody, Marcory, Yopougon"
                className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champsLivreur.zonesCouvertes}
                onChange={(e) => setChampsLivreur({ ...champsLivreur, zonesCouvertes: e.target.value })}
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

      {ajoutBoutiqueOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm animate-overlay-in">
          <div className="w-full max-w-sm animate-modal-pop rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Ajouter une boutique</h2>
              <button onClick={() => setAjoutBoutiqueOuvert(false)} className="text-ink/30 hover:text-ink/60">
                ✕
              </button>
            </div>
            <form onSubmit={ajouterBoutique}>
              <label className="mb-1 block text-xs font-medium text-ink/60">Nom de la boutique</label>
              <input
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champsBoutique.nomBoutique}
                onChange={(e) => setChampsBoutique({ ...champsBoutique, nomBoutique: e.target.value })}
                required
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">
                Téléphone (identifiant de connexion)
              </label>
              <input
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champsBoutique.telephone}
                onChange={(e) => setChampsBoutique({ ...champsBoutique, telephone: e.target.value })}
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
                value={champsBoutique.codePin}
                onChange={(e) =>
                  setChampsBoutique({ ...champsBoutique, codePin: e.target.value.replace(/\D/g, "").slice(0, 4) })
                }
                required
              />
              <label className="mb-1 block text-xs font-medium text-ink/60">Adresse</label>
              <input
                placeholder="Quartier, rue..."
                className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                value={champsBoutique.adresse}
                onChange={(e) => setChampsBoutique({ ...champsBoutique, adresse: e.target.value })}
              />
              <button
                type="submit"
                disabled={ajoutEnCours}
                className="w-full rounded-md bg-steel-500 py-2.5 text-sm font-semibold text-white hover:bg-steel-600 disabled:opacity-60"
              >
                {ajoutEnCours ? "Ajout..." : "Ajouter cette boutique"}
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
