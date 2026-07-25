export function DeliveryRoute({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        id="route-path"
        d="M 70 100 C 180 30, 280 30, 300 70 C 320 110, 420 130, 530 90"
        stroke="#5B93AC"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
        className="animate-dash-move"
      />

      <circle r="6" fill="#D4661E">
        <animateMotion dur="3.5s" repeatCount="indefinite" rotate="auto">
          <mpath href="#route-path" />
        </animateMotion>
      </circle>

      <g transform="translate(40, 78)">
        <rect x="0" y="14" width="44" height="32" rx="4" fill="#2E6E8E" />
        <path d="M -4 14 L 22 -6 L 48 14 Z" fill="#5B93AC" />
        <rect x="17" y="28" width="10" height="18" rx="1.5" fill="#14232B" />
      </g>

      <g transform="translate(500, 58)">
        <rect x="0" y="18" width="42" height="30" rx="4" fill="#2F7D52" />
        <path d="M -4 18 L 21 -8 L 46 18 Z" fill="#4F9A6F" />
        <rect x="16" y="30" width="10" height="18" rx="1.5" fill="#14232B" />
      </g>

      <g transform="translate(288, 44)" opacity="0.9">
        <rect x="0" y="6" width="14" height="22" rx="6" fill="#D4661E" />
        <rect x="4" y="0" width="6" height="7" rx="2" fill="#E58347" />
      </g>
    </svg>
  );
}
