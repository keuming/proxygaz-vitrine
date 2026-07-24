import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpcMutation } from "../lib/api";
import { Card } from "../components/Card";

const TYPES_DECHET = [
  { value: "menager", label: "Ménager" },
  { value: "encombrant", label: "Encombrant" },
  { value: "recyclable", label: "Recyclable" },
];

export function DemanderRamassage() {
  const navigate = useNavigate();
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("Abidjan");
  const [commune, setCommune] = useState("");
  const [typeDechet, setTypeDechet] = useState("menager");
  const [quantiteEstimee, setQuantiteEstimee] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [succes, setSucces] = useState(false);

  async function envoyer() {
    if (!adresse || !ville) return;
    setEnvoiEnCours(true);
    setErreur(null);
    try {
      await trpcMutation("ramassage.creerDemande", {
        adresse,
        ville,
        commune: commune || undefined,
        typeDechet,
        quantiteEstimee: quantiteEstimee || undefined,
      });
      setSucces(true);
      setTimeout(() => navigate("/mes-commandes"), 1500);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la demande");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (succes) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-lg bg-gaz-400/10 p-8">
          <p className="font-display text-xl font-semibold text-gaz-600">Demande envoyée !</p>
          <p className="mt-2 text-sm text-ink/60">
            Un ramasseur disponible dans votre zone va bientôt l'accepter. Redirection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Demander un ramassage</h1>
      <p className="mt-1 text-sm text-ink/60">
        Le premier ramasseur disponible dans votre zone acceptera votre demande.
      </p>

      {erreur && (
        <div className="mt-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      <Card className="mt-6 p-6">
        <label className="mb-2 block text-sm font-medium text-ink/70">Adresse</label>
        <input
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Rue, quartier..."
          className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
          required
        />

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink/70">Ville</label>
            <input
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink/70">Commune</label>
            <input
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              placeholder="Cocody..."
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
            />
          </div>
        </div>

        <label className="mb-2 block text-sm font-medium text-ink/70">Type de déchet</label>
        <div className="mb-5 flex gap-2">
          {TYPES_DECHET.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeDechet(t.value)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                typeDechet === t.value
                  ? "bg-steel-500 text-white"
                  : "bg-ink/5 text-ink/60 hover:bg-ink/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-sm font-medium text-ink/70">
          Quantité estimée (optionnel)
        </label>
        <input
          value={quantiteEstimee}
          onChange={(e) => setQuantiteEstimee(e.target.value)}
          placeholder="1 sac, plusieurs sacs, encombrants..."
          className="mb-6 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
        />

        <button
          onClick={envoyer}
          disabled={!adresse || !ville || envoiEnCours}
          className="w-full rounded-md bg-gaz-500 py-3 text-sm font-semibold text-white hover:bg-gaz-600 disabled:opacity-50"
        >
          {envoiEnCours ? "Envoi..." : "Envoyer la demande"}
        </button>
      </Card>
    </div>
  );
}
