import { useAuth } from "../lib/auth";

export function ProHeader({ titre, sousTitre }: { titre: string; sousTitre: string }) {
  const { user, deconnexion } = useAuth();

  return (
    <div
      className="bg-panel px-4 pb-4 sm:px-8"
      style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">{titre}</h1>
          <p className="text-xs text-white/50">{sousTitre}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-white">{user?.nom}</div>
          <button onClick={deconnexion} className="text-xs text-safety-400 hover:text-safety-300">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
