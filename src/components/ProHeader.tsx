import { useAuth } from "../lib/auth";

export function ProHeader({ titre, sousTitre }: { titre: string; sousTitre: string }) {
  const { user, deconnexion } = useAuth();

  return (
    <div
      className="shrink-0 bg-panel px-3 pb-3 sm:px-8"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-semibold text-white sm:text-lg">
            {titre}
          </h1>
          <p className="truncate text-[11px] text-white/50">{sousTitre}</p>
        </div>
        <div className="min-w-0 max-w-[38%] shrink-0 text-right">
          <div className="truncate text-xs font-medium text-white sm:text-sm">{user?.nom}</div>
          <button
            onClick={deconnexion}
            className="truncate text-[11px] text-safety-400 hover:text-safety-300"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
