const AVANTAGES = [
  "Suivez votre commande en temps réel, à tout moment",
  "Retrouvez l'historique complet de vos commandes (gaz et ramassage)",
  "Recommandez plus vite la prochaine fois — vos coordonnées sont déjà enregistrées",
  "Un seul compte pour tous vos services ProxiGaz",
];

export function AccountBenefits() {
  return (
    <div className="mb-3 rounded-md border border-steel-400/30 bg-steel-500/5 p-3">
      <p className="mb-2 text-xs font-semibold text-steel-600">
        Pourquoi créer un compte ?
      </p>
      <ul className="space-y-1">
        {AVANTAGES.map((avantage) => (
          <li key={avantage} className="flex items-start gap-2 text-xs text-ink/60">
            <span className="mt-0.5 text-gaz-500">✓</span>
            <span>{avantage}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
