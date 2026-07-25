import { useEffect, useState, useCallback } from "react";
import { trpcQuery } from "../../lib/api";
import { Card } from "../../components/Card";
import { MobilePayLogo } from "../../components/MobilePayLogo";

interface Transaction {
  id: string;
  clientNom: string;
  clientTelephone: string;
  prixPropose: string | null;
  modePaiement: "especes_livraison" | "mobile_money" | null;
  encaisseAt: string | null;
}

interface Encaissements {
  ramasseur: { nom: string; telephone: string };
  transactions: Transaction[];
  totaux: {
    especes: number;
    mobilePay: number;
    global: number;
    nbTransactions: number;
  };
}

export function EncaissementsRamasseurTab() {
  const [donnees, setDonnees] = useState<Encaissements | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(() => {
    setChargement(true);
    trpcQuery<Encaissements>("ramassage.mesEncaissements")
      .then(setDonnees)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  if (chargement) return <div className="p-6 text-sm text-ink/50">Chargement...</div>;
  if (erreur) return <div className="rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>;
  if (!donnees) return null;

  return (
    <div>
      <Card className="mb-4 flex items-center justify-between p-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-ink/40">Ramasseur</div>
          <div className="font-display text-sm font-semibold text-ink">{donnees.ramasseur.nom}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-ink/40">Téléphone</div>
          <div className="font-data text-sm font-medium text-ink">{donnees.ramasseur.telephone}</div>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-ink/40">Total encaissé</div>
          <div className="mt-1 font-data text-xl font-bold text-ink">
            {donnees.totaux.global.toLocaleString()} <span className="text-xs font-normal">FCFA</span>
          </div>
          <div className="mt-0.5 text-xs text-ink/40">{donnees.totaux.nbTransactions} transaction(s)</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-ink/40">💵 Espèces</div>
          <div className="mt-1 font-data text-xl font-bold text-steel-600">
            {donnees.totaux.especes.toLocaleString()} <span className="text-xs font-normal">FCFA</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink/40">
            <MobilePayLogo className="h-4 w-4" /> MobilePay
          </div>
          <div className="mt-1 font-data text-xl font-bold text-[#10B981]">
            {donnees.totaux.mobilePay.toLocaleString()} <span className="text-xs font-normal">FCFA</span>
          </div>
        </Card>
      </div>

      <Card>
        {donnees.transactions.length === 0 ? (
          <div className="p-6 text-sm text-ink/50">Aucun encaissement pour le moment.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/40">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Date et heure</th>
              </tr>
            </thead>
            <tbody>
              {donnees.transactions.map((t) => (
                <tr key={t.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">{t.clientNom}</td>
                  <td className="px-4 py-3 font-data text-ink/70">{t.clientTelephone}</td>
                  <td className="px-4 py-3">
                    {t.modePaiement === "mobile_money" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#10B981]">
                        <MobilePayLogo className="h-4 w-4" /> MobilePay
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-steel-600">
                        💵 Espèces
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-data font-medium">
                    {Number(t.prixPropose ?? 0).toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-3 font-data text-xs text-ink/50">
                    {t.encaisseAt ? (
                      <>
                        <div>{new Date(t.encaisseAt).toLocaleDateString("fr-FR")}</div>
                        <div className="text-ink/40">
                          {new Date(t.encaisseAt).toLocaleTimeString("fr-FR")}
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
