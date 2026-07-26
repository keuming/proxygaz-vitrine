export function WastePickupIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 220" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="188" width="400" height="4" fill="#16241F" opacity="0.08" />

      <circle cx="70" cy="46" r="40" fill="#2F7D52" opacity="0.08" />
      <circle cx="70" cy="46" r="24" fill="#2F7D52" opacity="0.12" />

      <g transform="translate(30, 96)">
        <rect x="0" y="40" width="68" height="50" rx="3" fill="#2E6E8E" />
        <path d="M -6 40 L 34 6 L 74 40 Z" fill="#5B93AC" />
        <rect x="26" y="58" width="16" height="32" rx="2" fill="#14232B" />
      </g>

      <g transform="translate(120, 150)">
        <ellipse cx="10" cy="26" rx="14" ry="16" fill="#16241F" opacity="0.75" />
        <path d="M 2 16 Q 10 8 18 16" stroke="#16241F" strokeWidth="2" fill="none" opacity="0.75" />
        <ellipse cx="34" cy="30" rx="12" ry="14" fill="#16241F" opacity="0.6" />
      </g>

      <path
        d="M 100 175 C 180 155, 240 195, 320 155"
        stroke="#2F7D52"
        strokeOpacity="0.3"
        strokeWidth="3"
        strokeDasharray="3 10"
        strokeLinecap="round"
        className="animate-dash-move"
      />

      <g transform="translate(230, 108)">
        <circle cx="16" cy="66" r="15" fill="#14232B" />
        <circle cx="16" cy="66" r="6" fill="#4F9A6F" />
        <circle cx="96" cy="66" r="15" fill="#14232B" />
        <circle cx="96" cy="66" r="6" fill="#4F9A6F" />

        <rect x="46" y="26" width="58" height="40" rx="4" fill="#2F7D52" />
        <rect x="50" y="18" width="50" height="10" rx="2" fill="#4F9A6F" />

        <path d="M 0 66 L 8 34 L 40 34 L 46 66 Z" fill="#2E6E8E" />
        <rect x="10" y="40" width="14" height="12" rx="1.5" fill="#E8F2EC" />

        <circle cx="18" cy="24" r="7" fill="#16241F" opacity="0.85" />
      </g>

      <ellipse cx="340" cy="24" rx="22" ry="8" fill="#4F9A6F" opacity="0.15" />
    </svg>
  );
}
