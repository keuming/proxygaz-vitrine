import { useEffect, useState, useCallback } from "react";
import { trpcQuery, trpcMutation } from "../../lib/api";
import { Card } from "../../components/Card";
import { StatusGauge } from "../../components/StatusGauge";
import { ProHeader } from "../../components/ProHeader";

interface LivraisonDisponible {
  id: string;
  adresseLivraison: string;
  quantite: number;
  prixTotal: string;
  boutiqueNom: string;
  boutiqueCommune: string | null;
  boutiqueVille: string;
}

interface MaLivraison {
  id: string;
  adresseLivraison: string;
  quantite: number;
  statut: string;
}

export function DashboardLivreur() {
  const [onglet, setOnglet] = useState<"disponibles" | "mesLivraisons">("disponibles");
  const [disponibles, setDisponibles] = useState<LivraisonDisponible[]>([]);
  const [mesLivraisons, setMesLivraisons] = useState<MaLivraison[]>([]);
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

  useEffect(() => {
    chargerDisponibles();
    chargerMesLivraisons();
  }, [chargerDisponibles, chargerMesLivraisons]);

  async function accepter(id: string) {
    setActionEnCours(id);
    setErreur(null);
    try {
      await trpcMutation("gaz.accepterLivraison", { commandeId: id });
      chargerDisponibles();
      chargerMesLivraisons();
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
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <ProHeader titre="Espace livreur" sousTitre="Livraisons de bouteilles de gaz" />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8">
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
            onClick={() => setOnglet("mesLivraisons")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              onglet === "mesLivraisons" ? "bg-steel-500 text-white" : "bg-white text-ink/60"
            }`}
          >
            Mes livraisons
          </button>
        </div>

        {erreur && (
          <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
        )}

        {onglet === "disponibles" ? (
          <div className="space-y-3">
            {disponibles.length === 0 ? (
              <p className="text-sm text-ink/40">Aucune livraison disponible dans votre zone.</p>
            ) : (
              disponibles.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="mb-1 text-sm font-medium text-ink">{c.boutiqueNom}</div>
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
  );
}
