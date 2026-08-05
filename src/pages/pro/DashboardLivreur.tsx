import { useEffect, useState, useCallback } from "react";
import { trpcQuery, trpcMutation } from "../../lib/api";
import { Card } from "../../components/Card";
import { StatusGauge } from "../../components/StatusGauge";
import { ProHeader } from "../../components/ProHeader";
import { BottomNav } from "../../components/BottomNav";
import { IconeDisponibles, IconeEnCours } from "../../components/NavIcons";
import { CreditIndicator } from "../../components/CreditIndicator";
import { CreditPurchaseModal } from "../../components/CreditPurchaseModal";
import { useAuth } from "../../lib/auth";

interface LivraisonDisponible {
  id: string;
  adresseLivraison: string;
  quantite: number;
  prixTotal: string;
  boutiqueNom: string;
  boutiqueCommune: string | null;
  boutiqueVille: string;
  distanceKm: number | null;
}

interface MaLivraison {
  id: string;
  adresseLivraison: string;
  quantite: number;
  statut: string;
}

interface StatsLivreur {
  totalLivraisons: number;
  livraisonsCeMois: number;
  valeurLivreeCeMois: number;
  tauxReussite: number;
  enCoursActuellement: number;
}

export function DashboardLivreur() {
  const { user } = useAuth();
  const [onglet, setOnglet] = useState<"disponibles" | "mesLivraisons">("disponibles");
  const [disponibles, setDisponibles] = useState<LivraisonDisponible[]>([]);
  const [mesLivraisons, setMesLivraisons] = useState<MaLivraison[]>([]);
  const [stats, setStats] = useState<StatsLivreur | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [achatOuvert, setAchatOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  const chargerDisponibles = useCallback(() => {
    trpcQuery<LivraisonDisponible[]>("gaz.livraisonsDisponibles")
      .then(setDisponibles)
      .catch((e) => setErreur(e.message));
  }, []);

  const chargerMesLivraisons = useCallback(() => {
    trpcQuery<MaLivraison[]>("gaz.mesLivraisons").then(setMesLivraisons).catch((e) => setErreur(e.message));
  }, []);

  const chargerStats = useCallback(() => {
    trpcQuery<StatsLivreur>("gaz.statsLivreur").then(setStats).catch(() => {});
  }, []);

  const chargerCredits = useCallback(() => {
    trpcQuery<{ credits: number }>("gaz.mesCreditsLivreur")
      .then((r) => setCredits(r.credits))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chargerDisponibles();
    chargerMesLivraisons();
    chargerStats();
    chargerCredits();
  }, [chargerDisponibles, chargerMesLivraisons, chargerStats, chargerCredits]);

  // Transmet la position GPS en direct pendant que le livreur a cette page ouverte, pour que
  // les courses disponibles lui soient présentées triées par proximité réelle.
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        trpcMutation("gaz.majPositionLivreur", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
          .then(() => chargerDisponibles())
          .catch(() => {});
      },
      () => {}, // silencieux si refusé — le tri retombe sur l'adresse d'inscription
      { enableHighAccuracy: true, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [chargerDisponibles]);

  async function accepter(id: string) {
    setActionEnCours(id);
    setErreur(null);
    try {
      await trpcMutation("gaz.accepterLivraison", { commandeId: id });
      chargerDisponibles();
      chargerMesLivraisons();
      chargerStats();
      chargerCredits();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Cette livraison a peut-être déjà été prise");
    } finally {
      setActionEnCours(null);
    }
  }

  async function marquerLivree(id: string) {
    setActionEnCours(id);
    try {
      await trpcMutation("gaz.marquerLivree", { commandeId: id });
      chargerMesLivraisons();
      chargerStats();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  async function demanderCredit(quantite: number, referencePaiement: string) {
    await trpcMutation("gaz.demanderCreditLivreur", { quantiteCredits: quantite, referencePaiement });
  }

  const NAV_ITEMS = [
    {
      value: "disponibles" as const,
      label: "Disponibles",
      icon: <IconeDisponibles />,
      badge: disponibles.length,
    },
    { value: "mesLivraisons" as const, label: "Mes livraisons", icon: <IconeEnCours /> },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <ProHeader titre="Espace livreur" sousTitre="Livraisons de bouteilles de gaz" />

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-8">
        {credits !== null && (
          <div className="mb-5">
            <CreditIndicator credits={credits} onAcheter={() => setAchatOuvert(true)} />
          </div>
        )}

        {stats && (
          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Card className="p-3">
              <div className="font-data text-lg font-bold text-ink">{stats.totalLivraisons}</div>
              <div className="text-xs text-ink/50">Total</div>
            </Card>
            <Card className="p-3">
              <div className="font-data text-lg font-bold text-gaz-600">{stats.livraisonsCeMois}</div>
              <div className="text-xs text-ink/50">Ce mois-ci</div>
            </Card>
            <Card className="p-3">
              <div className="font-data text-lg font-bold text-steel-600">{stats.tauxReussite}%</div>
              <div className="text-xs text-ink/50">Réussite</div>
            </Card>
            <Card className="p-3">
              <div className="font-data text-lg font-bold text-safety-500">{stats.enCoursActuellement}</div>
              <div className="text-xs text-ink/50">En cours</div>
            </Card>
          </div>
        )}

        {erreur && (
          <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">
            {erreur}
            {erreur.includes("Crédit insuffisant") && (
              <button
                onClick={() => setAchatOuvert(true)}
                className="ml-2 font-semibold underline hover:text-valve-700"
              >
                Acheter des crédits
              </button>
            )}
          </div>
        )}

        {onglet === "disponibles" ? (
          <div className="space-y-3">
            {credits === 0 && (
              <div className="rounded-md bg-safety-400/10 px-4 py-3 text-sm text-safety-600">
                Vous pouvez voir les livraisons disponibles, mais votre crédit est épuisé — achetez
                des crédits pour pouvoir en accepter.
              </div>
            )}
            {disponibles.length === 0 ? (
              <p className="text-sm text-ink/40">Aucune livraison disponible dans votre zone.</p>
            ) : (
              disponibles.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-medium text-ink">{c.boutiqueNom}</div>
                    {c.distanceKm !== null && (
                      <span className="rounded-full bg-steel-400/10 px-2 py-0.5 text-xs font-medium text-steel-600">
                        {c.distanceKm < 1 ? "< 1 km" : `${c.distanceKm} km`}
                      </span>
                    )}
                  </div>
                  <div className="mb-2 text-xs text-ink/50">
                    {c.boutiqueCommune ?? c.boutiqueVille} → {c.adresseLivraison}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-data text-sm font-semibold text-ink">
                      {c.quantite} × — {Number(c.prixTotal).toLocaleString()} FCFA
                    </span>
                    <button
                      onClick={() => accepter(c.id)}
                      disabled={actionEnCours === c.id}
                      className="rounded-md bg-gaz-500 px-4 py-2 text-xs font-semibold text-white hover:bg-gaz-600 disabled:opacity-60"
                    >
                      {actionEnCours === c.id ? "..." : "Accepter"}
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {mesLivraisons.length === 0 ? (
              <p className="text-sm text-ink/40">Aucune livraison en cours.</p>
            ) : (
              mesLivraisons.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="text-sm text-ink/70">{c.adresseLivraison}</div>
                    <StatusGauge statut={c.statut} />
                  </div>
                  {c.statut === "en_livraison" && (
                    <button
                      onClick={() => marquerLivree(c.id)}
                      disabled={actionEnCours === c.id}
                      className="w-full rounded-md bg-gaz-500 py-2 text-xs font-semibold text-white hover:bg-gaz-600 disabled:opacity-60"
                    >
                      Marquer comme livrée
                    </button>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
        </div>
      </div>

      <BottomNav
        items={NAV_ITEMS}
        actif={onglet}
        onChange={(v) => setOnglet(v as "disponibles" | "mesLivraisons")}
      />

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
