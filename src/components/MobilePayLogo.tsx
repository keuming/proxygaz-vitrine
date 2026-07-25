export function MobilePayLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect width="40" height="40" rx="10" fill="#10B981" />
      <path
        d="M9 28 L9 12 L14 12 L20 20 L26 12 L31 12 L31 28 L26.5 28 L26.5 19 L20.5 27 L19.5 27 L13.5 19 L13.5 28 Z"
        fill="white"
      />
    </svg>
  );
}
