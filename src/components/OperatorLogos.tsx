interface LogoProps {
  className?: string;
}

export function OrangeMoneyLogo({ className = "h-10 w-10" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect width="40" height="40" rx="10" fill="#FF7900" />
      <circle cx="20" cy="17" r="8" fill="none" stroke="white" strokeWidth="2.5" />
      <rect x="17" y="26" width="6" height="7" rx="2" fill="white" />
    </svg>
  );
}

export function WaveLogo({ className = "h-10 w-10" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect width="40" height="40" rx="10" fill="#1DC8CD" />
      <path
        d="M7 20 Q11 12 15 20 T23 20 T31 20"
        fill="none"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M7 26 Q11 18 15 26 T23 26 T31 26"
        fill="none"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function MtnMoneyLogo({ className = "h-10 w-10" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect width="40" height="40" rx="10" fill="#FFCB05" />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill="#14232B"
        fontFamily="Arial, sans-serif"
      >
        MTN
      </text>
    </svg>
  );
}

export function MoovMoneyLogo({ className = "h-10 w-10" }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect width="40" height="40" rx="10" fill="#003DA5" />
      <circle cx="14" cy="20" r="7" fill="#F7941E" opacity="0.9" />
      <circle cx="24" cy="20" r="7" fill="white" opacity="0.9" />
    </svg>
  );
}
