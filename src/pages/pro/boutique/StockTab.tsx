import { useEffect, useState, useCallback } from "react";
import { trpcQuery, trpcMutation } from "../../../lib/api";
import { Card } from "../../../components/Card";

interface StockItem {
  id: string;
  marqueGazId: string;
  marqueNom: string;
  marqueTaille: string;
  marquePrixRecharge: string;
  marquePrixConsigne: string | null;
  quantiteDisponible: number;
  seuilAlerte: number;
}

interface Marque {
  id: string;
  nom: string;
  taille: string;
  prixRecharge: string;
  prixConsigne: string | null;
}

export function StockTab() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    trpcQuery<StockItem[]>("gaz.monStock").then(setStock).catch((e) => setErreur(e.message));
    trpcQuery<Marque[]>("gaz.catalogue").then(setMarques).catch((e) => setErreur(e.message));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  async function majQuantite(marqueGazId: string, quantiteDisponible: number, seuilAlerte?: number) {
    try {
      await trpcMutation("gaz.majMonStock", { marqueGazId, quantiteDisponible, seuilAlerte });
      charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    }
  }

  const marquesSansStock = marques.filter((m) => !stock.some((s) => s.marqueGazId === m.id));
  const enRupture = stock.filter((s) => s.quantiteDisponible <= s.seuilAlerte);

  return (
    <div>
      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      <p className="mb-4 text-xs text-ink/40">
        Le prix affiché ici est le prix officiel encaissé auprès du client (défini par
        ProxiGaz) — à ne pas confondre avec votre prix d'achat auprès du fournisseur,
        visible dans l'onglet Approvisionnements.
      </p>

      {enRupture.length > 0 && (
        <div className="mb-4 rounded-md bg-safety-400/10 px-4 py-3 text-sm text-safety-600">
          ⚠ {enRupture.length} référence(s) sous le seuil d'alerte — pensez à réapprovisionner.
        </div>
      )}

      <div className="space-y-3">
        {stock.map((s) => {
          const enAlerte = s.quantiteDisponible <= s.seuilAlerte;
          return (
            <Card key={s.id} className={`p-4 ${enAlerte ? "border-safety-400" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {s.marqueNom} — {s.marqueTaille}
                    {enAlerte && <span className="ml-2 text-xs text-safety-500">● stock bas</span>}
                  </div>
                  <div className="font-data text-xs font-semibold text-gaz-600">
                    {Number(s.marquePrixRecharge).toLocaleString()} FCFA
                  </div>
                  <div className="text-xs text-ink/50">Seuil d'alerte : {s.seuilAlerte}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-ink/40">Quantité</label>
                    <input
                      type="number"
                      min={0}
                      defaultValue={s.quantiteDisponible}
                      onBlur={(e) => majQuantite(s.marqueGazId, Number(e.target.value), s.seuilAlerte)}
                      className="w-20 rounded-md border border-ink/15 px-2 py-1.5 text-right text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-ink/40">Seuil</label>
                    <input
                      type="number"
                      min={0}
                      defaultValue={s.seuilAlerte}
                      onBlur={(e) =>
                        majQuantite(s.marqueGazId, s.quantiteDisponible, Number(e.target.value))
                      }
                      className="w-16 rounded-md border border-ink/15 px-2 py-1.5 text-right text-sm"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {marquesSansStock.length > 0 && (
          <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink/40">
              Ajouter un stock
            </p>
            {marquesSansStock.map((m) => (
              <Card key={m.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {m.nom} — {m.taille}
                  </div>
                  <div className="font-data text-xs font-semibold text-gaz-600">
                    {Number(m.prixRecharge).toLocaleString()} FCFA
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (val > 0) majQuantite(m.id, val);
                  }}
                  className="w-20 rounded-md border border-ink/15 px-2 py-1.5 text-right text-sm"
                />
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
