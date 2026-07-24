import { useEffect, useState, useCallback, FormEvent } from "react";
import { trpcQuery, trpcMutation } from "../../../lib/api";
import { Card } from "../../../components/Card";

interface Fournisseur {
  id: string;
  nom: string;
}

interface Marque {
  id: string;
  nom: string;
  taille: string;
}

interface Approvisionnement {
  id: string;
  fournisseurNom: string;
  marqueNom: string;
  marqueTaille: string;
  quantite: number;
  prixAchatUnitaire: string | null;
  statut: string;
  dateCommande: string;
}

export function ApprovisionnementsTab() {
  const [appros, setAppros] = useState<Approvisionnement[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [formOuvert, setFormOuvert] = useState(false);
  const [fournisseurId, setFournisseurId] = useState("");
  const [marqueGazId, setMarqueGazId] = useState("");
  const [quantite, setQuantite] = useState(10);
  const [prixAchat, setPrixAchat] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  const charger = useCallback(() => {
    trpcQuery<Approvisionnement[]>("gaz.mesApprovisionnements").then(setAppros).catch((e) => setErreur(e.message));
    trpcQuery<Fournisseur[]>("gaz.mesFournisseurs").then(setFournisseurs).catch(() => {});
    trpcQuery<Marque[]>("gaz.catalogue").then(setMarques).catch(() => {});
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  async function creer(e: FormEvent) {
    e.preventDefault();
    if (!fournisseurId || !marqueGazId) return;
    setEnvoiEnCours(true);
    try {
      await trpcMutation("gaz.creerApprovisionnement", {
        fournisseurId,
        marqueGazId,
        quantite,
        prixAchatUnitaire: prixAchat ? Number(prixAchat) : undefined,
      });
      setFormOuvert(false);
      setQuantite(10);
      setPrixAchat("");
      charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function receptionner(id: string) {
    setActionEnCours(id);
    try {
      await trpcMutation("gaz.receptionnerApprovisionnement", { approvisionnementId: id });
      charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setFormOuvert(!formOuvert)}
          disabled={fournisseurs.length === 0}
          className="rounded-md bg-steel-500 px-4 py-2 text-xs font-medium text-white hover:bg-steel-600 disabled:opacity-50"
        >
          + Nouveau bon de commande
        </button>
      </div>

      {fournisseurs.length === 0 && (
        <p className="mb-4 text-xs text-ink/40">
          Ajoutez d'abord un fournisseur dans l'onglet "Fournisseurs" pour créer un bon de commande.
        </p>
      )}

      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      {formOuvert && (
        <Card className="mb-4 p-4">
          <form onSubmit={creer}>
            <select
              value={fournisseurId}
              onChange={(e) => setFournisseurId(e.target.value)}
              className="mb-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
              required
            >
              <option value="">Choisir un fournisseur</option>
              {fournisseurs.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
            <select
              value={marqueGazId}
              onChange={(e) => setMarqueGazId(e.target.value)}
              className="mb-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
              required
            >
              <option value="">Choisir une marque</option>
              {marques.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom} — {m.taille}
                </option>
              ))}
            </select>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <input
                type="number"
                min={1}
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
                placeholder="Quantité"
                className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                min={0}
                value={prixAchat}
                onChange={(e) => setPrixAchat(e.target.value)}
                placeholder="Prix d'achat unitaire (FCFA)"
                className="rounded-md border border-ink/15 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={envoiEnCours}
              className="w-full rounded-md bg-steel-500 py-2 text-sm font-medium text-white hover:bg-steel-600 disabled:opacity-60"
            >
              {envoiEnCours ? "Création..." : "Créer le bon de commande"}
            </button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {appros.length === 0 ? (
          <p className="text-sm text-ink/40">Aucun bon de commande.</p>
        ) : (
          appros.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="mb-1 flex items-start justify-between">
                <div className="text-sm font-medium text-ink">
                  {a.marqueNom} — {a.marqueTaille}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    a.statut === "receptionne"
                      ? "bg-gaz-400/10 text-gaz-600"
                      : "bg-safety-400/10 text-safety-600"
                  }`}
                >
                  {a.statut === "receptionne" ? "Réceptionné" : "Commandé"}
                </span>
              </div>
              <div className="mb-2 text-xs text-ink/50">
                {a.fournisseurNom} · {a.quantite} unités
                {a.prixAchatUnitaire && ` · ${Number(a.prixAchatUnitaire).toLocaleString()} FCFA/u`}
              </div>
              {a.statut === "commande" && (
                <button
                  onClick={() => receptionner(a.id)}
                  disabled={actionEnCours === a.id}
                  className="w-full rounded-md bg-gaz-500 py-1.5 text-xs font-medium text-white hover:bg-gaz-600 disabled:opacity-60"
                >
                  {actionEnCours === a.id ? "..." : "Marquer comme réceptionné"}
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
