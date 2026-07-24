import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpcMutation } from "../lib/api";
import { Card } from "../components/Card";
import { AddressPicker, AdresseChoisie } from "../components/AddressPicker";
import { useAuth } from "../lib/auth";

const TYPES_DECHET = [
  { value: "menager", label: "Ménager" },
  { value: "encombrant", label: "Encombrant" },
  { value: "recyclable", label: "Recyclable" },
];

export function DemanderRamassage() {
  const navigate = useNavigate();
  const { user, definirSession } = useAuth();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [ville, setVille] = useState("Abidjan");
  const [commune, setCommune] = useState("");
  const [typeDechet, setTypeDechet] = useState("menager");
  const [quantiteEstimee, setQuantiteEstimee] = useState("");
  const [creerCompte, setCreerCompte] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function envoyer() {
    if (!adresse || !ville) return;
    if (!user && (!nom || !telephone)) {
      setErreur("Nom et téléphone requis pour envoyer la demande");
      return;
    }

    setEnvoiEnCours(true);
    setErreur(null);
    try {
      const resultat = await trpcMutation<{
        demande: { id: string };
        token?: string;
        user?: { id: string; nom: string; role: "client" };
      }>("ramassage.creerDemande", {
        adresse,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        ville,
        commune: commune || undefined,
        typeDechet,
        quantiteEstimee: quantiteEstimee || undefined,
        ...(!user && {
          nomClient: nom,
          telephoneClient: telephone,
          motDePasseClient: creerCompte && motDePasse ? motDePasse : undefined,
        }),
      });

      if (resultat.token && resultat.user) {
        definirSession(resultat.token, resultat.user);
      }

      navigate("/mes-commandes");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la demande");
    } finally {
      setEnvoiEnCours(false);
    }
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
        {!user && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink/70">Nom et prénoms</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-ink/70">Téléphone</label>
              <input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="0700000000"
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                required
              />
            </div>
          </div>
        )}

        <label className="mb-2 block text-sm font-medium text-ink/70">Adresse</label>
        <div className="mb-4">
          <AddressPicker
            valeur={adresse}
            onChange={(a: AdresseChoisie) => {
              setAdresse(a.adresse);
              setLatitude(a.latitude);
              setLongitude(a.longitude);
            }}
          />
        </div>

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
          className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
        />

        {!user && (
          <div className="mb-5 rounded-md bg-ink/5 p-3">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={creerCompte}
                onChange={(e) => setCreerCompte(e.target.checked)}
              />
              Créer un compte pour retrouver mes demandes plus tard (optionnel)
            </label>
            {creerCompte && (
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="Choisissez un mot de passe"
                minLength={6}
                className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              />
            )}
          </div>
        )}

        <button
          onClick={envoyer}
          disabled={!adresse || !ville || envoiEnCours || (!user && (!nom || !telephone))}
          className="w-full rounded-md bg-gaz-500 py-3 text-sm font-semibold text-white hover:bg-gaz-600 disabled:opacity-50"
        >
          {envoiEnCours ? "Envoi..." : "Envoyer la demande"}
        </button>
      </Card>
    </div>
  );
}
