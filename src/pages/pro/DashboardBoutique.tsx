import { useEffect, useState, useCallback } from "react";
import { trpcQuery, trpcMutation } from "../../lib/api";
import { Card } from "../../components/Card";
import { StatusGauge } from "../../components/StatusGauge";
import { ProHeader } from "../../components/ProHeader";

interface Commande {
  id: string;
  clientNom: string;
  clientTelephone: string;
  adresseLivraison: string;
  quantite: number;
  prixTotal: string;
  statut: string;
}

interface StockItem {
  id: string;
  marqueGazId: string;
  marqueNom: string;
  marqueTaille: string;
  quantiteDisponible: number;
}

interface Marque {
  id: string;
  nom: string;
  taille: string;
}

export function DashboardBoutique() {
  const [onglet, setOnglet] = useState<"commandes" | "stock">("commandes");
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  const chargerCommandes = useCallback(() => {
    trpcQuery<Commande[]>("gaz.commandesBoutique").then(setCommandes).catch((e) => setErreur(e.message));
  }, []);

  const chargerStock = useCallback(() => {
    trpcQuery<StockItem[]>("gaz.monStock").then(setStock).catch((e) => setErreur(e.message));
    trpcQuery<Marque[]>("gaz.catalogue").then(setMarques).catch((e) => setErreur(e.message));
  }, []);

  useEffect(() => {
    chargerCommandes();
    chargerStock();
  }, [chargerCommandes, chargerStock]);

  async function confirmer(id: string) {
    setActionEnCours(id);
    try {
      await trpcMutation("gaz.confirmerCommande", { commandeId: id });
      chargerCommandes();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  async function demarrerLivraison(id: string) {
    setActionEnCours(id);
    try {
      await trpcMutation("gaz.demarrerLivraison", { commandeId: id });
      chargerCommandes();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  async function majStock(marqueGazId: string, quantite: number) {
    try {
      await trpcMutation("gaz.majMonStock", { marqueGazId, quantiteDisponible: quantite });
      chargerStock();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    }
  }

  const marquesSansStock = marques.filter((m) => !stock.some((s) => s.marqueGazId === m.id));

  return (
    <div className="min-h-screen bg-surface">
      <ProHeader titre="Espace boutique" sousTitre="Commandes et gestion du stock" />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setOnglet("commandes")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              onglet === "commandes" ? "bg-steel-500 text-white" : "bg-white text-ink/60"
            }`}
          >
            Commandes
          </button>
          <button
            onClick={() => setOnglet("stock")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              onglet === "stock" ? "bg-steel-500 text-white" : "bg-white text-ink/60"
            }`}
          >
            Stock
          </button>
        </div>

        {erreur && (
          <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
        )}

        {onglet === "commandes" ? (
          <div className="space-y-3">
            {commandes.length === 0 ? (
              <p className="text-sm text-ink/40">Aucune commande pour le moment.</p>
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
                  <div className="mb-3 text-sm text-ink/70">{c.adresseLivraison}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-data text-sm font-semibold text-ink">
                      {c.quantite} × — {Number(c.prixTotal).toLocaleString()} FCFA
                    </span>
                    {c.statut === "en_attente" && (
                      <button
                        onClick={() => confirmer(c.id)}
                        disabled={actionEnCours === c.id}
                        className="rounded-md bg-steel-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-steel-600 disabled:opacity-60"
                      >
                        Confirmer
                      </button>
                    )}
                    {c.statut === "confirmee" && (
                      <button
                        onClick={() => demarrerLivraison(c.id)}
                        disabled={actionEnCours === c.id}
                        className="rounded-md bg-gaz-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gaz-600 disabled:opacity-60"
                      >
                        Démarrer la livraison
                      </button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {stock.map((s) => (
              <Card key={s.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {s.marqueNom} — {s.marqueTaille}
                  </div>
                  <div className="text-xs text-ink/50">Quantité disponible</div>
                </div>
                <input
                  type="number"
                  min={0}
                  defaultValue={s.quantiteDisponible}
                  onBlur={(e) => majStock(s.marqueGazId, Number(e.target.value))}
                  className="w-20 rounded-md border border-ink/15 px-2 py-1.5 text-right text-sm"
                />
              </Card>
            ))}

            {marquesSansStock.length > 0 && (
              <>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink/40">
                  Ajouter un stock
                </p>
                {marquesSansStock.map((m) => (
                  <Card key={m.id} className="flex items-center justify-between p-4">
                    <div className="text-sm font-medium text-ink">
                      {m.nom} — {m.taille}
                    </div>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val > 0) majStock(m.id, val);
                      }}
                      className="w-20 rounded-md border border-ink/15 px-2 py-1.5 text-right text-sm"
                    />
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
