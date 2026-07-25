interface CreditIndicatorProps {
  credits: number;
  onAcheter: () => void;
}

export function CreditIndicator({ credits, onAcheter }: CreditIndicatorProps) {
  const epuise = credits === 0;
  const bas = credits > 0 && credits <= 3;

  const couleurFond = epuise ? "bg-valve-500" : bas ? "bg-safety-500" : "bg-gaz-500";

  return (
    <div
      className={`flex items-center justify-between rounded-xl p-4 text-white ${couleurFond} ${
        epuise || bas ? "animate-pulse-soft" : ""
      }`}
    >
      <div>
        <div className="text-xs font-medium uppercase tracking-wide opacity-80">
          Solde de crédits
        </div>
        <div className="font-data text-3xl font-bold">
          {credits} <span className="text-sm font-normal opacity-80">crédit{credits !== 1 ? "s" : ""}</span>
        </div>
        <div className="mt-0.5 text-xs opacity-80">
          {epuise
            ? "Crédit épuisé — achetez pour continuer à accepter des courses"
            : bas
            ? "Solde bas — pensez à recharger"
            : "1 crédit = 100 FCFA, débité à chaque course acceptée"}
        </div>
      </div>
      <button
        onClick={onAcheter}
        className="shrink-0 rounded-md bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-white/90"
      >
        Acheter
      </button>
    </div>
  );
}
