import { useState, useEffect } from "react";
import { trpcQuery } from "../../lib/api";
import { ProHeader } from "../../components/ProHeader";
import { BottomNav } from "../../components/BottomNav";
import { IconeCommandes, IconeStock, IconeCaisse, IconePlus } from "../../components/NavIcons";
import { CommandesTab } from "./boutique/CommandesTab";
import { StockTab } from "./boutique/StockTab";
import { FournisseursTab } from "./boutique/FournisseursTab";
import { ApprovisionnementsTab } from "./boutique/ApprovisionnementsTab";
import { HistoriqueTab } from "./boutique/HistoriqueTab";
import { EncaissementsTab } from "./boutique/EncaissementsTab";

type OngletPrincipal = "commandes" | "stock" | "encaissements" | "plus";
type SousOngletPlus = "fournisseurs" | "approvisionnements" | "historique";

const NAV_ITEMS = [
  { value: "commandes" as const, label: "Commandes", icon: <IconeCommandes /> },
  { value: "stock" as const, label: "Stock", icon: <IconeStock /> },
  { value: "encaissements" as const, label: "Caisse", icon: <IconeCaisse /> },
  { value: "plus" as const, label: "Plus", icon: <IconePlus /> },
];

const SOUS_ONGLETS_PLUS: { value: SousOngletPlus; label: string; description: string }[] = [
  { value: "fournisseurs", label: "Fournisseurs", description: "Vos partenaires d'approvisionnement" },
  { value: "approvisionnements", label: "Approvisionnements", description: "Bons de commande et réceptions" },
  { value: "historique", label: "Historique", description: "Tous les mouvements de stock" },
];

export function DashboardBoutique() {
  const [onglet, setOnglet] = useState<OngletPrincipal>("commandes");
  const [sousOngletPlus, setSousOngletPlus] = useState<SousOngletPlus | null>(null);
  const [nomBoutique, setNomBoutique] = useState<string | null>(null);

  useEffect(() => {
    trpcQuery<{ nomBoutique: string }>("gaz.monProfilBoutique")
      .then((r) => setNomBoutique(r.nomBoutique))
      .catch(() => {});
  }, []);

  function changerOnglet(valeur: string) {
    setOnglet(valeur as OngletPrincipal);
    if (valeur !== "plus") setSousOngletPlus(null);
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-surface">
      <ProHeader
        titre={nomBoutique ?? "Espace boutique"}
        sousTitre="Gestion complète de votre point de vente"
      />

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-8">
          {onglet === "commandes" && <CommandesTab />}
          {onglet === "stock" && <StockTab />}
          {onglet === "encaissements" && <EncaissementsTab />}

          {onglet === "plus" && (
            <>
              {sousOngletPlus === null ? (
                <div className="space-y-3">
                  {SOUS_ONGLETS_PLUS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSousOngletPlus(s.value)}
                      className="flex w-full items-center justify-between rounded-lg border border-ink/10 bg-white p-4 text-left shadow-sm transition-colors hover:border-steel-400"
                    >
                      <div>
                        <div className="text-sm font-semibold text-ink">{s.label}</div>
                        <div className="text-xs text-ink/50">{s.description}</div>
                      </div>
                      <span className="text-ink/30">›</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSousOngletPlus(null)}
                    className="mb-4 flex items-center gap-1 text-sm font-medium text-steel-600"
                  >
                    ← Retour
                  </button>
                  {sousOngletPlus === "fournisseurs" && <FournisseursTab />}
                  {sousOngletPlus === "approvisionnements" && <ApprovisionnementsTab />}
                  {sousOngletPlus === "historique" && <HistoriqueTab />}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav items={NAV_ITEMS} actif={onglet} onChange={changerOnglet} />
    </div>
  );
}
