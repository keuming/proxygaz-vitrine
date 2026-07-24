import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { trpcMutation } from "../lib/api";

export function AuthClient() {
  const { connexion, loading, error, clearError, definirSession } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");

  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("Abidjan");
  const [commune, setCommune] = useState("");
  const [inscriptionEnCours, setInscriptionEnCours] = useState(false);
  const [erreurInscription, setErreurInscription] = useState<string | null>(null);

  async function onConnexion(e: FormEvent) {
    e.preventDefault();
    try {
      const user = await connexion(telephone, motDePasse);
      if (user.role !== "client") {
        navigate("/pro");
        return;
      }
      navigate("/commander-gaz");
    } catch {
      // erreur déjà affichée via le contexte
    }
  }

  async function onInscription(e: FormEvent) {
    e.preventDefault();
    setInscriptionEnCours(true);
    setErreurInscription(null);
    try {
      const data = await trpcMutation<{ token: string; user: { id: string; nom: string; role: "client" } }>(
        "auth.inscriptionClient",
        { nom, telephone, motDePasse, ville, commune: commune || undefined }
      );
      definirSession(data.token, data.user);
      navigate("/commander-gaz");
    } catch (e) {
      setErreurInscription(e instanceof Error ? e.message : "Erreur lors de l'inscription");
    } finally {
      setInscriptionEnCours(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="font-display text-2xl font-bold text-ink">
            PROXI<span className="text-safety-500">GAZ</span>
          </div>
          <p className="mt-1 text-sm text-ink/60">
            {mode === "connexion" ? "Connectez-vous pour commander" : "Créez votre compte"}
          </p>
        </div>

        <div className="mb-4 flex rounded-lg bg-ink/5 p-1">
          <button
            onClick={() => {
              setMode("connexion");
              clearError();
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "connexion" ? "bg-white text-ink shadow-sm" : "text-ink/50"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => {
              setMode("inscription");
              clearError();
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "inscription" ? "bg-white text-ink shadow-sm" : "text-ink/50"
            }`}
          >
            Inscription
          </button>
        </div>

        {mode === "connexion" ? (
          <form onSubmit={onConnexion} className="rounded-lg bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-ink/70">Téléphone</label>
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="0700000000"
              className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              required
            />
            <label className="mb-1 block text-sm font-medium text-ink/70">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              required
            />
            {error && (
              <div className="mb-4 rounded-md bg-valve-400/10 px-3 py-2 text-sm text-valve-600">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-steel-500 py-2.5 text-sm font-medium text-white hover:bg-steel-600 disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={onInscription} className="rounded-lg bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-ink/70">Nom complet</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              required
            />
            <label className="mb-1 block text-sm font-medium text-ink/70">Téléphone</label>
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="0700000000"
              className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              required
            />
            <label className="mb-1 block text-sm font-medium text-ink/70">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              minLength={6}
              className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              required
            />
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink/70">Ville</label>
                <input
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink/70">Commune</label>
                <input
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                />
              </div>
            </div>
            {erreurInscription && (
              <div className="mb-4 rounded-md bg-valve-400/10 px-3 py-2 text-sm text-valve-600">
                {erreurInscription}
              </div>
            )}
            <button
              type="submit"
              disabled={inscriptionEnCours}
              className="w-full rounded-md bg-safety-500 py-2.5 text-sm font-medium text-white hover:bg-safety-600 disabled:opacity-60"
            >
              {inscriptionEnCours ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-ink/40">
          <Link to="/" className="hover:text-ink/70">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
