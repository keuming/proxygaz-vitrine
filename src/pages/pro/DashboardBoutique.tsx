import { useState } from "react";
import { ProHeader } from "../../components/ProHeader";
import { CommandesTab } from "./boutique/CommandesTab";
import { StockTab } from "./boutique/StockTab";
import { FournisseursTab } from "./boutique/FournisseursTab";
import { ApprovisionnementsTab } from "./boutique/ApprovisionnementsTab";
import { HistoriqueTab } from "./boutique/HistoriqueTab";

type Onglet = "commandes" | "stock" | "fournisseurs" | "approvisionnements" | "historique";

const ONGLETS: { value: Onglet; label: string }[] = [
  { value: "commandes", label: "Commandes" },
  { value: "stock", label: "Stock" },
  { value: "fournisseurs", label: "Fournisseurs" },
  { value: "approvisionnements", label: "Approvisionnements" },
  { value: "historique", label: "Historique" },
];

export function DashboardBoutique() {
  const [onglet, setOnglet] = useState<Onglet>("commandes");

  return (
    <div className="min-h-screen bg-surface">
      <ProHeader titre="Espace boutique" sousTitre="Gestion complète de votre point de vente" />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {ONGLETS.map((o) => (
            <button
              key={o.value}
              onClick={() => setOnglet(o.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                onglet === o.value ? "bg-steel-500 text-white" : "bg-white text-ink/60 hover:bg-ink/5"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {onglet === "commandes" && <CommandesTab />}
        {onglet === "stock" && <StockTab />}
        {onglet === "fournisseurs" && <FournisseursTab />}
        {onglet === "approvisionnements" && <ApprovisionnementsTab />}
        {onglet === "historique" && <HistoriqueTab />}
      </div>
    </div>
  );
}
