import { ReactNode } from "react";

export function SuccessModal({
  titre,
  sousTitre,
  couleur = "gaz",
  children,
}: {
  titre: string;
  sousTitre?: string;
  couleur?: "gaz" | "safety";
  children?: ReactNode;
}) {
  const teinte = couleur === "gaz" ? "gaz" : "safety";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm animate-overlay-in">
      <div className="w-full max-w-sm animate-modal-pop rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <svg viewBox="0 0 80 80" className="h-20 w-20">
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              strokeWidth="4"
              className={`animate-draw-circle ${teinte === "gaz" ? "stroke-gaz-500" : "stroke-safety-500"}`}
              strokeLinecap="round"
              strokeDasharray="220"
            />
            <path
              d="M24 41 L35 52 L57 29"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`animate-draw-check ${teinte === "gaz" ? "stroke-gaz-500" : "stroke-safety-500"}`}
              strokeDasharray="48"
            />
          </svg>
        </div>

        <h2 className="font-display text-xl font-semibold text-ink">{titre}</h2>
        {sousTitre && <p className="mt-2 text-sm text-ink/60">{sousTitre}</p>}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
