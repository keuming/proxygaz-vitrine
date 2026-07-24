import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

const CHEMINS_PAR_ROLE: Record<string, string> = {
  boutique: "/pro/boutique",
  livreur: "/pro/livreur",
  ramasseur: "/pro/ramasseur",
};

export function LoginPro() {
  const { connexion, loading, error } = useAuth();
  const navigate = useNavigate();
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const user = await connexion(telephone, motDePasse);
      const chemin = CHEMINS_PAR_ROLE[user.role];
      if (!chemin) {
        navigate("/");
        return;
      }
      navigate(chemin);
    } catch {
      // erreur déjà exposée via le contexte
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-panel px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="font-display text-2xl font-bold text-white">
            PROXI<span className="text-safety-400">GAZ</span>
          </div>
          <p className="mt-1 text-sm text-white/60">Espace professionnel</p>
          <p className="mt-1 text-xs text-white/40">Boutique de gaz · Livreur · Ramasseur</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-lg bg-white p-6 shadow-xl">
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

        <p className="mt-4 text-center text-xs text-white/40">
          Pas encore inscrit ?{" "}
          <Link to="/pro/inscription" className="text-white/70 hover:text-white">
            Créer un compte professionnel
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-white/40">
          <Link to="/" className="hover:text-white/70">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
