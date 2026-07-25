import { useState } from "react";
import { MobilePayCheckout, InfosPaiementMobilePay } from "./MobilePayCheckout";
import { SuccessModal } from "./SuccessModal";

const PALIERS = [5, 10, 20, 50];

export function CreditPurchaseModal({
  nomSuggere,
  telephoneSuggere,
  onDemander,
  onFermer,
}: {
  nomSuggere: string;
  telephoneSuggere: string;
  onDemander: (quantite: number, referencePaiement: string) => Promise<void>;
  onFermer: () => void;
}) {
  const [quantite, setQuantite] = useState(10);
  const [checkoutOuvert, setCheckoutOuvert] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const LABELS_OPERATEURS: Record<string, string> = {
    orange_money: "Orange Money",
    wave: "Wave",
    mtn_money: "MTN Money",
    moov_money: "Moov Money",
  };

  async function apresPaiement(infos: InfosPaiementMobilePay) {
    setCheckoutOuvert(false);
    try {
      await onDemander(
        quantite,
        `${LABELS_OPERATEURS[infos.operateur]} — ${infos.numeroCompte} — ${infos.nomPayeur}`
      );
      setSucces(true);
      setTimeout(onFermer, 2200);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la demande");
    }
  }

  if (succes) {
    return (
      <SuccessModal
        titre="Demande envoyée !"
        sousTitre="Votre crédit sera mis à disposition par l'équipe ProxiGaz sous peu."
        couleur="gaz"
      />
    );
  }

  if (checkoutOuvert) {
    return (
      <MobilePayCheckout
        typeService={`Achat de ${quantite} crédit(s) ProxiGaz`}
        nomSuggere={nomSuggere}
        telephoneSuggere={telephoneSuggere}
        montantSuggere={quantite * 100}
        onTermine={apresPaiement}
        onAnnuler={() => setCheckoutOuvert(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm animate-overlay-in">
      <div className="w-full max-w-sm animate-modal-pop rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Acheter des crédits</h2>
          <button onClick={onFermer} className="text-ink/30 hover:text-ink/60">
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-ink/60">
          1 crédit = 100 FCFA. Chaque course acceptée consomme 1 crédit.
        </p>

        <div className="mb-4 grid grid-cols-4 gap-2">
          {PALIERS.map((p) => (
            <button
              key={p}
              onClick={() => setQuantite(p)}
              className={`rounded-md border-2 py-2 text-sm font-semibold transition-colors ${
                quantite === p ? "border-steel-500 bg-steel-500/5 text-steel-600" : "border-ink/10 text-ink/60"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-medium text-ink/60">Quantité personnalisée</label>
        <input
          type="number"
          min={1}
          value={quantite}
          onChange={(e) => setQuantite(Math.max(1, Number(e.target.value)))}
          className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
        />

        {erreur && (
          <div className="mb-4 rounded-md bg-valve-400/10 px-3 py-2 text-xs text-valve-600">{erreur}</div>
        )}

        <div className="mb-4 flex items-center justify-between rounded-md bg-ink/5 px-4 py-3">
          <span className="text-sm text-ink/60">Total à payer</span>
          <span className="font-data text-lg font-semibold text-ink">
            {(quantite * 100).toLocaleString()} FCFA
          </span>
        </div>

        <button
          onClick={() => setCheckoutOuvert(true)}
          className="w-full rounded-md bg-[#10B981] py-3 text-sm font-semibold text-white hover:bg-[#0EA271]"
        >
          Payer avec MobilePay
        </button>
      </div>
    </div>
  );
}
