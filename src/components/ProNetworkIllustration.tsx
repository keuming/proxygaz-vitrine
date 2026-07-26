export function ProNetworkIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 220" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="188" width="400" height="4" fill="white" opacity="0.06" />

      <g transform="translate(40, 100)">
        <rect x="0" y="34" width="76" height="56" rx="3" fill="#2E6E8E" />
        <path d="M -6 34 L 38 0 L 82 34 Z" fill="#5B93AC" />
        <rect x="30" y="52" width="16" height="38" rx="2" fill="#0E1B22" />
        <rect x="10" y="46" width="14" height="14" rx="1.5" fill="#E8F2EC" opacity="0.9" />
        <rect x="52" y="46" width="14" height="14" rx="1.5" fill="#E8F2EC" opacity="0.9" />
      </g>

      <g transform="translate(150, 40)">
        <rect x="0" y="0" width="120" height="80" rx="8" fill="#F4F6F5" />
        <rect x="10" y="12" width="50" height="8" rx="2" fill="#D4661E" />
        <rect x="10" y="28" width="100" height="6" rx="2" fill="#16241F" opacity="0.15" />
        <rect x="10" y="40" width="80" height="6" rx="2" fill="#16241F" opacity="0.15" />
        <rect x="10" y="54" width="34" height="16" rx="3" fill="#2F7D52" opacity="0.85" />
        <rect x="50" y="54" width="34" height="16" rx="3" fill="#5B93AC" opacity="0.85" />
      </g>

      <g transform="translate(280, 118)">
        <circle cx="14" cy="46" r="12" fill="#0E1B22" />
        <circle cx="14" cy="46" r="5" fill="#D4661E" />
        <circle cx="70" cy="46" r="12" fill="#0E1B22" />
        <circle cx="70" cy="46" r="5" fill="#D4661E" />
        <path d="M 6 46 L 18 24 L 50 24 L 62 36 L 74 36 L 74 46 Z" fill="#D4661E" />
        <rect x="46" y="6" width="6" height="20" rx="2" fill="#0E1B22" />
      </g>

      <path
        id="pro-link"
        d="M 116 128 C 140 100, 150 90, 165 80"
        stroke="#5B93AC"
        strokeOpacity="0.3"
        strokeWidth="2.5"
        strokeDasharray="2 8"
        className="animate-dash-move"
      />
      <path
        d="M 270 100 C 250 90, 230 85, 210 82"
        stroke="#5B93AC"
        strokeOpacity="0.3"
        strokeWidth="2.5"
        strokeDasharray="2 8"
        className="animate-dash-move"
      />

      <circle r="4" fill="#D4661E">
        <animateMotion dur="3s" repeatCount="indefinite">
          <mpath href="#pro-link" />
        </animateMotion>
      </circle>
    </svg>
  );
}
