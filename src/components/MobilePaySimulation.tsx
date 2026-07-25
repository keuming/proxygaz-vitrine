import { useEffect, useState } from "react";
import { MobilePayLogo } from "./MobilePayLogo";

type Phase = "attente" | "confirme";

export function MobilePaySimulation({
  telephone,
  montant,
  onTermine,
}: {
  telephone: string;
  montant: number;
  onTermine: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("attente");

  useEffect(() => {
    const versConfirme = setTimeout(() => setPhase("confirme"), 2800);
    return () => clearTimeout(versConfirme);
  }, []);

  useEffect(() => {
    if (phase !== "confirme") return;
    const fin = setTimeout(onTermine, 1300);
    return () => clearTimeout(fin);
  }, [phase, onTermine]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm animate-overlay-in">
      <div className="w-full max-w-sm animate-modal-pop rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5">
          <MobilePayLogo className={`mx-auto h-16 w-16 ${phase === "attente" ? "animate-pulse-soft" : ""}`} />
        </div>

        {phase === "attente" ? (
          <>
            <h2 className="font-display text-lg font-semibold text-ink">
              Confirmez sur votre téléphone
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Une demande de paiement de{" "}
              <span className="font-data font-semibold text-ink">{montant.toLocaleString()} FCFA</span>{" "}
              a été envoyée au <span className="font-data">{telephone}</span>.
            </p>
            <div className="mx-auto mt-5 flex justify-center gap-1.5">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-[#10B981]" />
              <span
                className="h-2 w-2 animate-pulse-soft rounded-full bg-[#10B981]"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="h-2 w-2 animate-pulse-soft rounded-full bg-[#10B981]"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <p className="mt-4 text-xs text-ink/40">
              Composez votre code MobilePay pour valider la transaction.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto -mt-2 mb-2 flex h-14 w-14 items-center justify-center">
              <svg viewBox="0 0 56 56" className="h-14 w-14">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  strokeWidth="4"
                  className="animate-draw-circle stroke-[#10B981]"
                  strokeLinecap="round"
                  strokeDasharray="151"
                />
                <path
                  d="M17 29 L24 36 L40 20"
                  fill="none"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-draw-check stroke-[#10B981]"
                  strokeDasharray="34"
                />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold text-ink">Paiement confirmé</h2>
            <p className="mt-2 text-sm text-ink/60">
              {montant.toLocaleString()} FCFA débités via MobilePay.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
