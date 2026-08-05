import { useAuth } from "../lib/auth";

export function ProHeader({ titre, sousTitre }: { titre: string; sousTitre: string }) {
  const { user, deconnexion } = useAuth();

  return (
    <div
      className="sticky top-0 z-20 bg-panel px-4 pb-4 sm:px-8"
      style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-semibold text-white">{titre}</h1>
          <p className="truncate text-xs text-white/50">{sousTitre}</p>
        </div>
        <div className="min-w-0 max-w-[40%] shrink-0 text-right">
          <div className="truncate text-sm font-medium text-white">{user?.nom}</div>
          <button
            onClick={deconnexion}
            className="whitespace-nowrap text-xs text-safety-400 hover:text-safety-300"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
