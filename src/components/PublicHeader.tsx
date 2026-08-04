import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function PublicHeader() {
  const { user, deconnexion } = useAuth();
  const location = useLocation();

  if (location.pathname.startsWith("/pro/")) return null;

  return (
    <header className="border-b border-ink/10 bg-white px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/" className="font-display text-lg font-bold text-ink">
          PROXI<span className="text-safety-500">GAZ</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/commander-gaz" className="text-ink/70 hover:text-ink">
            Gaz
          </Link>
          <Link to="/demander-ramassage" className="text-ink/70 hover:text-ink">
            Ramassage
          </Link>
          {user?.role === "client" ? (
            <>
              <Link to="/mes-commandes" className="text-ink/70 hover:text-ink">
                Mes commandes
              </Link>
              <button onClick={deconnexion} className="text-valve-500 hover:text-valve-600">
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/connexion"
              className="rounded-md bg-steel-500 px-3 py-1.5 text-white hover:bg-steel-600"
            >
              Se connecter
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
