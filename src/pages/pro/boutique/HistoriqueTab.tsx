import { useEffect, useState } from "react";
import { trpcQuery } from "../../../lib/api";
import { Card } from "../../../components/Card";

interface Mouvement {
  id: string;
  marqueNom: string;
  marqueTaille: string;
  typeMouvement: string;
  quantite: number;
  soldeApres: number;
  notes: string | null;
  createdAt: string;
}

const LABELS_TYPE: Record<string, { label: string; color: string }> = {
  entree_fournisseur: { label: "Entrée fournisseur", color: "text-gaz-600" },
  vente: { label: "Vente", color: "text-steel-600" },
  ajustement: { label: "Ajustement", color: "text-safety-600" },
  retour: { label: "Retour", color: "text-valve-600" },
};

export function HistoriqueTab() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    trpcQuery<Mouvement[]>("gaz.monHistoriqueStock").then(setMouvements).catch((e) => setErreur(e.message));
  }, []);

  return (
    <div>
      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      <Card>
        {mouvements.length === 0 ? (
          <p className="p-4 text-sm text-ink/40">Aucun mouvement enregistré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/40">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Marque</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Quantité</th>
                <th className="px-4 py-3">Solde après</th>
              </tr>
            </thead>
            <tbody>
              {mouvements.map((m) => {
                const config = LABELS_TYPE[m.typeMouvement] ?? { label: m.typeMouvement, color: "text-ink" };
                return (
                  <tr key={m.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 font-data text-xs text-ink/60">
                      {new Date(m.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {m.marqueNom} — {m.marqueTaille}
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${config.color}`}>{config.label}</td>
                    <td className="px-4 py-3 font-data">
                      {m.quantite > 0 ? `+${m.quantite}` : m.quantite}
                    </td>
                    <td className="px-4 py-3 font-data font-medium">{m.soldeApres}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
