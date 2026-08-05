import { ReactNode } from "react";

export interface BottomNavItem {
  value: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export function BottomNav({
  items,
  actif,
  onChange,
}: {
  items: BottomNavItem[];
  actif: string;
  onChange: (valeur: string) => void;
}) {
  return (
    <nav
      className="flex shrink-0 border-t border-black/10 bg-panel shadow-[0_-2px_10px_rgba(0,0,0,0.15)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const estActif = actif === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
              estActif ? "text-white" : "text-white/40"
            }`}
          >
            <span className="relative flex h-6 w-6 items-center justify-center">
              {item.icon}
              {!!item.badge && item.badge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-safety-500 px-1 text-[9px] font-bold text-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-medium ${estActif ? "font-semibold" : ""}`}>
              {item.label}
            </span>
            {estActif && (
              <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-safety-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
