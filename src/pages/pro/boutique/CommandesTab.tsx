import { useEffect, useState, useCallback } from "react";
import { trpcQuery, trpcMutation } from "../../../lib/api";
import { Card } from "../../../components/Card";
import { StatusGauge } from "../../../components/StatusGauge";

interface Commande {
  id: string;
  clientNom: string;
  clientTelephone: string;
  adresseLivraison: string;
  quantite: number;
  prixTotal: string;
  statut: string;
  raisonNonLivraison: string | null;
}

const ONGLETS_STATUT = [
  { value: "", label: "Toutes" },
  { value: "en_attente", label: "Nouvelles" },
  { value: "confirmee", label: "En préparation" },
  { value: "en_livraison", label: "En livraison" },
  { value: "livree", label: "Livrées" },
  { value: "non_livree", label: "Non livrées" },
  { value: "annulee", label: "Annulées" },
];

export function CommandesTab() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filtre, setFiltre] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [raisonModal, setRaisonModal] = useState<string | null>(null);
  const [raison, setRaison] = useState("");

  const charger = useCallback(() => {
    trpcQuery<Commande[]>("gaz.commandesBoutique", filtre ? { statut: filtre } : {})
      .then(setCommandes)
      .catch((e) => setErreur(e.message));
  }, [filtre]);

  useEffect(() => {
    charger();
  }, [charger]);

  async function action(id: string, path: string, extra?: Record<string, unknown>) {
    setActionEnCours(id);
    setErreur(null);
    try {
      await trpcMutation(path, { commandeId: id, ...extra });
      charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  async function confirmerNonLivraison() {
    if (!raisonModal || !raison.trim()) return;
    await action(raisonModal, "gaz.marquerNonLivree", { raison: raison.trim() });
    setRaisonModal(null);
    setRaison("");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {ONGLETS_STATUT.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltre(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filtre === f.value ? "bg-steel-500 text-white" : "bg-white text-ink/60 hover:bg-ink/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      <div className="space-y-3">
        {commandes.length === 0 ? (
          <p className="text-sm text-ink/40">Aucune commande pour ce filtre.</p>
        ) : (
          commandes.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">{c.clientNom}</div>
                  <div className="text-xs text-ink/50">{c.clientTelephone}</div>
                </div>
                <StatusGauge statut={c.statut} />
              </div>
              <div className="mb-1 text-sm text-ink/70">{c.adresseLivraison}</div>
              {c.raisonNonLivraison && (
                <div className="mb-2 rounded bg-valve-400/10 px-2 py-1 text-xs text-valve-600">
                  Motif : {c.raisonNonLivraison}
                </div>
              )}
              <div className="mb-3 font-data text-sm font-semibold text-ink">
                {c.quantite} × — {Number(c.prixTotal).toLocaleString()} FCFA
              </div>

              <div className="flex flex-wrap gap-2">
                {c.statut === "en_attente" && (
                  <>
                    <button
                      onClick={() => action(c.id, "gaz.confirmerCommande")}
                      disabled={actionEnCours === c.id}
                      className="rounded-md bg-steel-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-steel-600 disabled:opacity-60"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => action(c.id, "gaz.annulerCommande")}
                      disabled={actionEnCours === c.id}
                      className="rounded-md bg-valve-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-valve-600 disabled:opacity-60"
                    >
                      Annuler
                    </button>
                  </>
                )}
                {c.statut === "confirmee" && (
                  <>
                    <button
                      onClick={() => action(c.id, "gaz.demarrerLivraison")}
                      disabled={actionEnCours === c.id}
                      className="rounded-md bg-gaz-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gaz-600 disabled:opacity-60"
                    >
                      Démarrer la livraison
                    </button>
                    <button
                      onClick={() => action(c.id, "gaz.annulerCommande")}
                      disabled={actionEnCours === c.id}
                      className="rounded-md bg-valve-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-valve-600 disabled:opacity-60"
                    >
                      Annuler
                    </button>
                  </>
                )}
                {c.statut === "en_livraison" && (
                  <>
                    <button
                      onClick={() => action(c.id, "gaz.marquerLivree")}
                      disabled={actionEnCours === c.id}
                      className="rounded-md bg-gaz-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gaz-600 disabled:opacity-60"
                    >
                      Marquer livrée
                    </button>
                    <button
                      onClick={() => setRaisonModal(c.id)}
                      disabled={actionEnCours === c.id}
                      className="rounded-md bg-safety-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-safety-600 disabled:opacity-60"
                    >
                      Échec de livraison
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {raisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h3 className="mb-3 font-display text-base font-semibold text-ink">
              Motif de l'échec de livraison
            </h3>
            <textarea
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              rows={3}
              placeholder="Client absent, adresse introuvable..."
              className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRaisonModal(null);
                  setRaison("");
                }}
                className="flex-1 rounded-md bg-ink/5 py-2 text-sm text-ink/70 hover:bg-ink/10"
              >
                Annuler
              </button>
              <button
                onClick={confirmerNonLivraison}
                disabled={!raison.trim()}
                className="flex-1 rounded-md bg-safety-500 py-2 text-sm font-medium text-white hover:bg-safety-600 disabled:opacity-50"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
