import { useAuth } from "../lib/auth";

export function ProHeader({ titre, sousTitre }: { titre: string; sousTitre: string }) {
  const { user, deconnexion } = useAuth();

  return (
    <div className="border-b border-ink/10 bg-white px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{titre}</h1>
          <p className="text-xs text-ink/50">{sousTitre}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-ink">{user?.nom}</div>
          <button onClick={deconnexion} className="text-xs text-valve-500 hover:text-valve-600">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
