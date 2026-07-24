import { useLocation } from "react-router-dom";

export function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith("/pro/")) return null;

  return (
    <footer
      className="bg-panel px-6 pt-10 text-white"
      style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-white">
              PROXI<span className="text-safety-400">GAZ</span>
            </div>
            <p className="mt-2 text-xs text-white/50">
              Un service Compagnie des Services Numériques (CSN) — Abidjan, Côte d'Ivoire
            </p>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
              Service client
            </div>
            <a
              href="tel:+2250507108648"
              className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-safety-400"
            >
              <span className="text-steel-400">☎</span> +225 05 07 10 86 48
            </a>
            <a
              href="mailto:service.client@csn-solutions.tech"
              className="mt-1.5 flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-safety-400"
            >
              <span className="text-steel-400">✉</span> service.client@csn-solutions.tech
            </a>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
              Liens rapides
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-white/70">
              <a href="/commander-gaz" className="transition-colors hover:text-safety-400">
                Commander du gaz
              </a>
              <a href="/demander-ramassage" className="transition-colors hover:text-safety-400">
                Demander un ramassage
              </a>
              <a href="/pro" className="transition-colors hover:text-safety-400">
                Espace professionnel
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} ProxiGaz — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
