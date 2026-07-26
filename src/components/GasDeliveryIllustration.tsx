export function GasDeliveryIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 220" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Sol */}
      <rect x="0" y="188" width="400" height="4" fill="#16241F" opacity="0.08" />

      {/* Soleil / halo décoratif */}
      <circle cx="330" cy="50" r="46" fill="#D4661E" opacity="0.08" />
      <circle cx="330" cy="50" r="28" fill="#D4661E" opacity="0.12" />

      {/* Maison (destination) */}
      <g transform="translate(300, 100)">
        <rect x="0" y="40" width="72" height="52" rx="3" fill="#2F7D52" />
        <path d="M -6 40 L 36 4 L 78 40 Z" fill="#4F9A6F" />
        <rect x="28" y="60" width="18" height="32" rx="2" fill="#14232B" />
        <rect x="52" y="52" width="14" height="14" rx="1.5" fill="#E8F2EC" />
      </g>

      {/* Route pointillée */}
      <path
        d="M 40 170 C 120 150, 200 190, 280 150"
        stroke="#5B93AC"
        strokeOpacity="0.3"
        strokeWidth="3"
        strokeDasharray="3 10"
        strokeLinecap="round"
        className="animate-dash-move"
      />

      {/* Scooter du livreur */}
      <g transform="translate(70, 118)">
        {/* Roues */}
        <circle cx="14" cy="58" r="14" fill="#14232B" />
        <circle cx="14" cy="58" r="6" fill="#5B93AC" />
        <circle cx="82" cy="58" r="14" fill="#14232B" />
        <circle cx="82" cy="58" r="6" fill="#5B93AC" />

        {/* Corps du scooter */}
        <path d="M 6 58 L 20 30 L 60 30 L 74 44 L 88 44 L 88 58 Z" fill="#2E6E8E" />
        <rect x="56" y="8" width="6" height="24" rx="2" fill="#14232B" />
        <rect x="46" y="6" width="24" height="6" rx="2" fill="#14232B" />

        {/* Bouteille de gaz transportée à l'arrière */}
        <g transform="translate(2, 8)">
          <path
            d="M 0 20 Q 0 8 12 8 Q 24 8 24 20 L 24 42 Q 24 50 12 50 Q 0 50 0 42 Z"
            fill="#D4661E"
          />
          <rect x="8" y="2" width="8" height="6" rx="1.5" fill="#E58347" />
        </g>

        {/* Conducteur (silhouette simplifiée) */}
        <circle cx="50" cy="8" r="8" fill="#16241F" opacity="0.85" />
        <path d="M 42 20 Q 50 8 62 18 L 58 34 L 40 34 Z" fill="#16241F" opacity="0.85" />
      </g>

      {/* Petits nuages décoratifs */}
      <ellipse cx="60" cy="30" rx="20" ry="8" fill="#5B93AC" opacity="0.15" />
      <ellipse cx="150" cy="20" rx="26" ry="9" fill="#5B93AC" opacity="0.12" />
    </svg>
  );
}
