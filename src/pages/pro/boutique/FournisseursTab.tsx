import { useEffect, useState, useCallback, FormEvent } from "react";
import { trpcQuery, trpcMutation } from "../../../lib/api";
import { Card } from "../../../components/Card";

interface Fournisseur {
  id: string;
  nom: string;
  telephone: string | null;
  adresse: string | null;
  actif: boolean;
}

export function FournisseursTab() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [formOuvert, setFormOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const charger = useCallback(() => {
    trpcQuery<Fournisseur[]>("gaz.mesFournisseurs").then(setFournisseurs).catch((e) => setErreur(e.message));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  async function creer(e: FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    try {
      await trpcMutation("gaz.creerFournisseur", {
        nom,
        telephone: telephone || undefined,
        adresse: adresse || undefined,
      });
      setNom("");
      setTelephone("");
      setAdresse("");
      setFormOuvert(false);
      charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setFormOuvert(!formOuvert)}
          className="rounded-md bg-steel-500 px-4 py-2 text-xs font-medium text-white hover:bg-steel-600"
        >
          + Ajouter un fournisseur
        </button>
      </div>

      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      {formOuvert && (
        <Card className="mb-4 p-4">
          <form onSubmit={creer}>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom du fournisseur"
              className="mb-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
              required
            />
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Téléphone (optionnel)"
              className="mb-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
            />
            <input
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Adresse (optionnel)"
              className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={envoiEnCours}
              className="w-full rounded-md bg-steel-500 py-2 text-sm font-medium text-white hover:bg-steel-600 disabled:opacity-60"
            >
              {envoiEnCours ? "Ajout..." : "Ajouter"}
            </button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {fournisseurs.length === 0 ? (
          <p className="text-sm text-ink/40">Aucun fournisseur enregistré.</p>
        ) : (
          fournisseurs.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="text-sm font-medium text-ink">{f.nom}</div>
              {f.telephone && <div className="text-xs text-ink/50">{f.telephone}</div>}
              {f.adresse && <div className="text-xs text-ink/50">{f.adresse}</div>}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
