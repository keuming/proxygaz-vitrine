import { useEffect, useState, useCallback } from "react";
import { trpcQuery, trpcMutation } from "../../lib/api";
import { Card } from "../../components/Card";
import { StatusGauge } from "../../components/StatusGauge";
import { ProHeader } from "../../components/ProHeader";

interface DemandeDisponible {
  id: string;
  adresse: string;
  ville: string;
  commune: string | null;
  typeDechet: string;
  quantiteEstimee: string | null;
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
  const [onglet, setOnglet] = useState<"disponibles" | "mesRamassages">("disponibles");
  const [disponibles, setDisponibles] = useState<DemandeDisponible[]>([]);
  const [mesRamassages, setMesRamassages] = useState<MonRamassage[]>([]);
  const [stats, setStats] = useState<StatsRamasseur | null>(null);
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

  useEffect(() => {
    chargerDisponibles();
    chargerMesRamassages();
    chargerStats();
  }, [chargerDisponibles, chargerMesRamassages, chargerStats]);

  async function valider(id: string) {
    setActionEnCours(id);
    setErreur(null);
    try {
      await trpcMutation("ramassage.validerDemande", { demandeId: id });
      chargerDisponibles();
      chargerMesRamassages();
      chargerStats();
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

  return (
    <div className="min-h-screen bg-surface">
      <ProHeader titre="Espace ramasseur" sousTitre="Demandes de ramassage de poubelles" />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8">
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-4">
              <div className="font-data text-xl font-bold text-ink">{stats.totalRamassages}</div>
              <div className="text-xs text-ink/50">Ramassages au total</div>
            </Card>
            <Card className="p-4">
              <div className="font-data text-xl font-bold text-gaz-600">{stats.ramassagesCeMois}</div>
              <div className="text-xs text-ink/50">Ce mois-ci</div>
            </Card>
            <Card className="p-4">
              <div className="font-data text-xl font-bold text-steel-600">{stats.enCoursActuellement}</div>
              <div className="text-xs text-ink/50">En cours</div>
            </Card>
            <Card className="p-4">
              <div className="font-data text-xl font-bold text-safety-500">
                {stats.valideesEnAttenteDeDemarrage}
              </div>
              <div className="text-xs text-ink/50">À démarrer</div>
            </Card>
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setOnglet("disponibles")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              onglet === "disponibles" ? "bg-steel-500 text-white" : "bg-white text-ink/60"
            }`}
          >
            Disponibles
          </button>
          <button
            onClick={() => setOnglet("mesRamassages")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              onglet === "mesRamassages" ? "bg-steel-500 text-white" : "bg-white text-ink/60"
            }`}
          >
            Mes ramassages
          </button>
        </div>

        {erreur && (
          <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
        )}

        {onglet === "disponibles" ? (
          <div className="space-y-3">
            {disponibles.length === 0 ? (
              <p className="text-sm text-ink/40">Aucune demande disponible dans votre zone.</p>
            ) : (
              disponibles.map((d) => (
                <Card key={d.id} className="p-4">
                  <div className="mb-1 text-sm font-medium text-ink">
                    {d.adresse} — {d.commune ?? d.ville}
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
  );
}
