function Base({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      {children}
    </svg>
  );
}

export function IconeCommandes() {
  return (
    <Base>
      <rect x="4" y="7" width="16" height="13" rx="1.5" strokeLinejoin="round" />
      <path d="M8 7V5a4 4 0 0 1 8 0v2" strokeLinecap="round" />
      <path d="M9 11h6" strokeLinecap="round" />
    </Base>
  );
}

export function IconeStock() {
  return (
    <Base>
      <path d="M4 7l8-4 8 4-8 4-8-4z" strokeLinejoin="round" />
      <path d="M4 7v10l8 4 8-4V7" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12 11v10" />
    </Base>
  );
}

export function IconeBoutique() {
  return (
    <Base>
      <path d="M4 9l1-5h14l1 5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
      <path d="M5 9v10h14V9" strokeLinejoin="round" />
      <path d="M10 19v-5h4v5" strokeLinejoin="round" />
    </Base>
  );
}

export function IconeRamassage() {
  return (
    <Base>
      <path d="M5 7h14" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinejoin="round" />
      <path d="M6.5 7l1 12a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-12" strokeLinejoin="round" />
      <path d="M10 10.5v6" strokeLinecap="round" />
      <path d="M14 10.5v6" strokeLinecap="round" />
    </Base>
  );
}

export function IconeCaisse() {
  return (
    <Base>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="8" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconePlus() {
  return (
    <Base>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconeDisponibles() {
  return (
    <Base>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.2" />
    </Base>
  );
}

export function IconeEnCours() {
  return (
    <Base>
      <rect x="3" y="9" width="13" height="8" rx="1.5" />
      <path d="M16 12h3l2 3v2h-5z" strokeLinejoin="round" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="17" cy="18.5" r="1.5" />
    </Base>
  );
}

export function IconeCredit() {
  return (
    <Base>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M7 14.5h4" strokeLinecap="round" />
    </Base>
  );
}
