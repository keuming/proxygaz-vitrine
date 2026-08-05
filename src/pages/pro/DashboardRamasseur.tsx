import { useEffect, useState, useCallback } from "react";
import { trpcQuery, trpcMutation } from "../../lib/api";
import { Card } from "../../components/Card";
import { StatusGauge } from "../../components/StatusGauge";
import { ProHeader } from "../../components/ProHeader";
import { BottomNav } from "../../components/BottomNav";
import { IconeDisponibles, IconeEnCours, IconeCaisse } from "../../components/NavIcons";
import { EncaissementsRamasseurTab } from "./EncaissementsRamasseurTab";
import { CreditIndicator } from "../../components/CreditIndicator";
import { CreditPurchaseModal } from "../../components/CreditPurchaseModal";
import { useAuth } from "../../lib/auth";

interface DemandeDisponible {
  id: string;
  adresse: string;
  ville: string;
  commune: string | null;
  typeDechet: string;
  quantiteEstimee: string | null;
  distanceKm: number | null;
}

interface MonRamassage {
  id: string;
  adresse: string;
  ville: string;
  statut: string;
}

interface StatsRamasseur {
  totalRamassages: number;
  ramassagesCeMois: number;
  enCoursActuellement: number;
  valideesEnAttenteDeDemarrage: number;
}

export function DashboardRamasseur() {
  const { user } = useAuth();
  const [onglet, setOnglet] = useState<"disponibles" | "mesRamassages" | "encaissements">("disponibles");
  const [disponibles, setDisponibles] = useState<DemandeDisponible[]>([]);
  const [mesRamassages, setMesRamassages] = useState<MonRamassage[]>([]);
  const [stats, setStats] = useState<StatsRamasseur | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [achatOuvert, setAchatOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  const chargerDisponibles = useCallback(() => {
    trpcQuery<DemandeDisponible[]>("ramassage.demandesDisponibles")
      .then(setDisponibles)
      .catch((e) => setErreur(e.message));
  }, []);

  const chargerMesRamassages = useCallback(() => {
    trpcQuery<MonRamassage[]>("ramassage.mesRamassages")
      .then(setMesRamassages)
      .catch((e) => setErreur(e.message));
  }, []);

  const chargerStats = useCallback(() => {
    trpcQuery<StatsRamasseur>("ramassage.statsRamasseur").then(setStats).catch(() => {});
  }, []);

  const chargerCredits = useCallback(() => {
    trpcQuery<{ credits: number }>("ramassage.mesCreditsRamasseur")
      .then((r) => setCredits(r.credits))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chargerDisponibles();
    chargerMesRamassages();
    chargerStats();
    chargerCredits();
  }, [chargerDisponibles, chargerMesRamassages, chargerStats, chargerCredits]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        trpcMutation("ramassage.majPositionRamasseur", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
          .then(() => chargerDisponibles())
          .catch(() => {});
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [chargerDisponibles]);

  async function valider(id: string) {
    setActionEnCours(id);
    setErreur(null);
    try {
      await trpcMutation("ramassage.validerDemande", { demandeId: id });
      chargerDisponibles();
      chargerMesRamassages();
      chargerStats();
      chargerCredits();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Cette demande a peut-être déjà été prise");
    } finally {
      setActionEnCours(null);
    }
  }

  async function demarrer(id: string) {
    setActionEnCours(id);
    try {
      await trpcMutation("ramassage.demarrerRamassage", { demandeId: id });
      chargerMesRamassages();
      chargerStats();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  async function terminer(id: string) {
    setActionEnCours(id);
    try {
      await trpcMutation("ramassage.terminerDemande", { demandeId: id });
      chargerMesRamassages();
      chargerStats();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  async function demanderCredit(quantite: number, referencePaiement: string) {
    await trpcMutation("ramassage.demanderCreditRamasseur", {
      quantiteCredits: quantite,
      referencePaiement,
    });
  }

  const NAV_ITEMS = [
    {
      value: "disponibles" as const,
      label: "Disponibles",
      icon: <IconeDisponibles />,
      badge: disponibles.length,
    },
    { value: "mesRamassages" as const, label: "En cours", icon: <IconeEnCours /> },
    { value: "encaissements" as const, label: "Caisse", icon: <IconeCaisse /> },
  ];

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-surface">
      <ProHeader titre="Espace ramasseur" sousTitre="Demandes de ramassage de poubelles" />

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
              <div className="font-data text-lg font-bold text-ink">{stats.totalRamassages}</div>
              <div className="text-xs text-ink/50">Total</div>
            </Card>
            <Card className="p-3">
              <div className="font-data text-lg font-bold text-gaz-600">{stats.ramassagesCeMois}</div>
              <div className="text-xs text-ink/50">Ce mois-ci</div>
            </Card>
            <Card className="p-3">
              <div className="font-data text-lg font-bold text-steel-600">{stats.enCoursActuellement}</div>
              <div className="text-xs text-ink/50">En cours</div>
            </Card>
            <Card className="p-3">
              <div className="font-data text-lg font-bold text-safety-500">
                {stats.valideesEnAttenteDeDemarrage}
              </div>
              <div className="text-xs text-ink/50">À démarrer</div>
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

        {onglet === "encaissements" ? (
          <EncaissementsRamasseurTab />
        ) : onglet === "disponibles" ? (
          <div className="space-y-3">
            {credits === 0 && (
              <div className="rounded-md bg-safety-400/10 px-4 py-3 text-sm text-safety-600">
                Vous pouvez voir les demandes disponibles, mais votre crédit est épuisé — achetez
                des crédits pour pouvoir en accepter.
              </div>
            )}
            {disponibles.length === 0 ? (
              <p className="text-sm text-ink/40">Aucune demande disponible dans votre zone.</p>
            ) : (
              disponibles.map((d) => (
                <Card key={d.id} className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-medium text-ink">
                      {d.adresse} — {d.commune ?? d.ville}
                    </div>
                    {d.distanceKm !== null && (
                      <span className="shrink-0 rounded-full bg-steel-400/10 px-2 py-0.5 text-xs font-medium text-steel-600">
                        {d.distanceKm < 1 ? "< 1 km" : `${d.distanceKm} km`}
                      </span>
                    )}
                  </div>
                  <div className="mb-3 text-xs text-ink/50">
                    {d.typeDechet} {d.quantiteEstimee ? `· ${d.quantiteEstimee}` : ""}
                  </div>
                  <button
                    onClick={() => valider(d.id)}
                    disabled={actionEnCours === d.id}
                    className="w-full rounded-md bg-gaz-500 py-2 text-xs font-semibold text-white hover:bg-gaz-600 disabled:opacity-60"
                  >
                    {actionEnCours === d.id ? "..." : "Accepter"}
                  </button>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {mesRamassages.length === 0 ? (
              <p className="text-sm text-ink/40">Aucun ramassage en cours.</p>
            ) : (
              mesRamassages.map((d) => (
                <Card key={d.id} className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="text-sm text-ink/70">
                      {d.adresse} — {d.ville}
                    </div>
                    <StatusGauge statut={d.statut} />
                  </div>
                  {d.statut === "validee" && (
                    <button
                      onClick={() => demarrer(d.id)}
                      disabled={actionEnCours === d.id}
                      className="w-full rounded-md bg-steel-500 py-2 text-xs font-semibold text-white hover:bg-steel-600 disabled:opacity-60"
                    >
                      Démarrer le ramassage
                    </button>
                  )}
                  {d.statut === "en_cours" && (
                    <button
                      onClick={() => terminer(d.id)}
                      disabled={actionEnCours === d.id}
                      className="w-full rounded-md bg-gaz-500 py-2 text-xs font-semibold text-white hover:bg-gaz-600 disabled:opacity-60"
                    >
                      Marquer comme terminé
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
        onChange={(v) => setOnglet(v as "disponibles" | "mesRamassages" | "encaissements")}
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
