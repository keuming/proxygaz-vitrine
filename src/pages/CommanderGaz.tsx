import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpcQuery, trpcMutation } from "../lib/api";
import { Card } from "../components/Card";

interface Marque {
  id: string;
  nom: string;
  taille: string;
  prixRecharge: string;
}

interface BoutiqueDisponible {
  boutique: { id: string; nomBoutique: string; ville: string; commune: string | null };
  quantiteDisponible: number;
}

export function CommanderGaz() {
  const navigate = useNavigate();
  const [marques, setMarques] = useState<Marque[]>([]);
  const [marqueId, setMarqueId] = useState<string | null>(null);
  const [boutiques, setBoutiques] = useState<BoutiqueDisponible[]>([]);
  const [boutiqueId, setBoutiqueId] = useState<string | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [adresse, setAdresse] = useState("");
  const [notes, setNotes] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    trpcQuery<Marque[]>("gaz.catalogue")
      .then(setMarques)
      .catch((e) => setErreur(e.message));
  }, []);

  useEffect(() => {
    if (!marqueId) {
      setBoutiques([]);
      setBoutiqueId(null);
      return;
    }
    trpcQuery<BoutiqueDisponible[]>("gaz.boutiquesDisponibles", { marqueGazId: marqueId })
      .then((r) => {
        setBoutiques(r);
        setBoutiqueId(r[0]?.boutique.id ?? null);
      })
      .catch((e) => setErreur(e.message));
  }, [marqueId]);

  const marqueChoisie = marques.find((m) => m.id === marqueId);
  const prixTotal = marqueChoisie ? Number(marqueChoisie.prixRecharge) * quantite : 0;

  async function commander() {
    if (!marqueId || !adresse) return;
    setEnvoiEnCours(true);
    setErreur(null);
    try {
      await trpcMutation("gaz.creerCommande", {
        marqueGazId: marqueId,
        boutiqueId: boutiqueId ?? undefined,
        quantite,
        adresseLivraison: adresse,
        notes: notes || undefined,
      });
      setSucces(true);
      setTimeout(() => navigate("/mes-commandes"), 1500);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la commande");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (succes) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-lg bg-gaz-400/10 p-8">
          <p className="font-display text-xl font-semibold text-gaz-600">Commande envoyée !</p>
          <p className="mt-2 text-sm text-ink/60">
            Redirection vers vos commandes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Commander une bouteille de gaz</h1>
      <p className="mt-1 text-sm text-ink/60">
        Choisissez votre marque, votre taille, et indiquez votre adresse de livraison.
      </p>

      {erreur && (
        <div className="mt-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      <Card className="mt-6 p-6">
        <label className="mb-2 block text-sm font-medium text-ink/70">Marque et taille</label>
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {marques.map((m) => (
            <button
              key={m.id}
              onClick={() => setMarqueId(m.id)}
              className={`rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                marqueId === m.id
                  ? "border-steel-500 bg-steel-500/5 text-steel-600"
                  : "border-ink/15 text-ink/70 hover:border-ink/30"
              }`}
            >
              <div className="font-medium">
                {m.nom} — {m.taille}
              </div>
              <div className="text-xs text-ink/50">{Number(m.prixRecharge).toLocaleString()} FCFA</div>
            </button>
          ))}
          {marques.length === 0 && (
            <p className="col-span-full text-sm text-ink/40">
              Aucune marque disponible pour le moment.
            </p>
          )}
        </div>

        {marqueId && (
          <>
            <label className="mb-2 block text-sm font-medium text-ink/70">Boutique</label>
            {boutiques.length === 0 ? (
              <p className="mb-5 text-sm text-valve-600">
                Aucune boutique n'a de stock pour cette marque actuellement.
              </p>
            ) : (
              <select
                value={boutiqueId ?? ""}
                onChange={(e) => setBoutiqueId(e.target.value)}
                className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              >
                {boutiques.map((b) => (
                  <option key={b.boutique.id} value={b.boutique.id}>
                    {b.boutique.nomBoutique} — {b.boutique.commune ?? b.boutique.ville} (
                    {b.quantiteDisponible} en stock)
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        <label className="mb-2 block text-sm font-medium text-ink/70">Quantité</label>
        <input
          type="number"
          min={1}
          value={quantite}
          onChange={(e) => setQuantite(Math.max(1, Number(e.target.value)))}
          className="mb-5 w-24 rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
        />

        <label className="mb-2 block text-sm font-medium text-ink/70">Adresse de livraison</label>
        <input
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Rue, quartier, commune..."
          className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
          required
        />

        <label className="mb-2 block text-sm font-medium text-ink/70">Notes (optionnel)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mb-6 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
        />

        {marqueChoisie && (
          <div className="mb-5 flex items-center justify-between rounded-md bg-ink/5 px-4 py-3">
            <span className="text-sm text-ink/60">Total</span>
            <span className="font-data text-lg font-semibold text-ink">
              {prixTotal.toLocaleString()} FCFA
            </span>
          </div>
        )}

        <button
          onClick={commander}
          disabled={!marqueId || !boutiqueId || !adresse || envoiEnCours}
          className="w-full rounded-md bg-safety-500 py-3 text-sm font-semibold text-white hover:bg-safety-600 disabled:opacity-50"
        >
          {envoiEnCours ? "Envoi..." : "Commander"}
        </button>
      </Card>
    </div>
  );
}
