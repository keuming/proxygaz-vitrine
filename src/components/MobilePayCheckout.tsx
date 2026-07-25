import { useEffect, useState } from "react";
import { MobilePayLogo } from "./MobilePayLogo";
import { OrangeMoneyLogo, WaveLogo, MtnMoneyLogo, MoovMoneyLogo } from "./OperatorLogos";

type Etape = "infos" | "resume" | "attente" | "confirme";
type Operateur = "orange_money" | "wave" | "mtn_money" | "moov_money";

const OPERATEURS: { value: Operateur; label: string; Logo: typeof MobilePayLogo }[] = [
  { value: "orange_money", label: "Orange Money", Logo: OrangeMoneyLogo },
  { value: "wave", label: "Wave", Logo: WaveLogo },
  { value: "mtn_money", label: "MTN Money", Logo: MtnMoneyLogo },
  { value: "moov_money", label: "Moov Money", Logo: MoovMoneyLogo },
];

export interface InfosPaiementMobilePay {
  nomPayeur: string;
  operateur: Operateur;
  numeroCompte: string;
  montant: number;
}

export function MobilePayCheckout({
  typeService,
  nomSuggere,
  telephoneSuggere,
  montantSuggere,
  onTermine,
  onAnnuler,
}: {
  typeService: string;
  nomSuggere: string;
  telephoneSuggere: string;
  montantSuggere: number;
  onTermine: (infos: InfosPaiementMobilePay) => void;
  onAnnuler: () => void;
}) {
  const [etape, setEtape] = useState<Etape>("infos");

  const [nomPayeur, setNomPayeur] = useState(nomSuggere);
  const [operateur, setOperateur] = useState<Operateur | null>(null);
  const [numeroCompte, setNumeroCompte] = useState(telephoneSuggere);
  const [montant, setMontant] = useState(montantSuggere);

  const operateurChoisi = OPERATEURS.find((o) => o.value === operateur);

  function passerAuResume() {
    if (!nomPayeur || !operateur || !numeroCompte || !montant) return;
    setEtape("resume");
  }

  function valider() {
    setEtape("attente");
  }

  useEffect(() => {
    if (etape !== "attente") return;
    const t = setTimeout(() => setEtape("confirme"), 5000);
    return () => clearTimeout(t);
  }, [etape]);

  useEffect(() => {
    if (etape !== "confirme" || !operateur) return;
    const t = setTimeout(() => {
      onTermine({ nomPayeur, operateur, numeroCompte, montant });
    }, 1400);
    return () => clearTimeout(t);
  }, [etape]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm animate-overlay-in">
      <div className="max-h-[90vh] w-full max-w-sm animate-modal-pop overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        {etape === "infos" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MobilePayLogo className="h-8 w-8" />
                <span className="font-display text-base font-semibold text-ink">Paiement MobilePay</span>
              </div>
              <button onClick={onAnnuler} className="text-ink/30 hover:text-ink/60">
                ✕
              </button>
            </div>

            <label className="mb-1 block text-xs font-medium text-ink/60">Nom et prénoms</label>
            <input
              value={nomPayeur}
              onChange={(e) => setNomPayeur(e.target.value)}
              className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-[#10B981]"
              required
            />

            <label className="mb-1 block text-xs font-medium text-ink/60">Service à payer</label>
            <div className="mb-3 rounded-md bg-ink/5 px-3 py-2 text-sm text-ink/70">{typeService}</div>

            <label className="mb-2 block text-xs font-medium text-ink/60">Mode de paiement</label>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {OPERATEURS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOperateur(o.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors ${
                    operateur === o.value
                      ? "border-[#10B981] bg-[#10B981]/5"
                      : "border-ink/10 hover:border-ink/20"
                  }`}
                >
                  <o.Logo className="h-9 w-9" />
                  <span className="text-[11px] font-medium text-ink/70">{o.label}</span>
                </button>
              ))}
            </div>

            <label className="mb-1 block text-xs font-medium text-ink/60">Numéro de compte</label>
            <input
              value={numeroCompte}
              onChange={(e) => setNumeroCompte(e.target.value)}
              placeholder="0700000000"
              className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-[#10B981]"
              required
            />

            <label className="mb-1 block text-xs font-medium text-ink/60">Montant à payer (FCFA)</label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(Number(e.target.value))}
              className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-[#10B981]"
              required
            />

            <button
              onClick={passerAuResume}
              disabled={!nomPayeur || !operateur || !numeroCompte || !montant}
              className="w-full rounded-md bg-[#10B981] py-3 text-sm font-semibold text-white hover:bg-[#0EA271] disabled:opacity-50"
            >
              Suivant
            </button>
          </>
        )}

        {etape === "resume" && operateurChoisi && (
          <>
            <div className="mb-5 flex items-center gap-2">
              <MobilePayLogo className="h-8 w-8" />
              <span className="font-display text-base font-semibold text-ink">Récapitulatif</span>
            </div>

            <div className="mb-4 divide-y divide-ink/10 rounded-lg border border-ink/10">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink/50">Nom et prénoms</span>
                <span className="font-medium text-ink">{nomPayeur}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink/50">Service</span>
                <span className="font-medium text-ink">{typeService}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink/50">Mode de paiement</span>
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <operateurChoisi.Logo className="h-5 w-5" />
                  {operateurChoisi.label}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink/50">Numéro de compte</span>
                <span className="font-data font-medium text-ink">{numeroCompte}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink/50">Montant à payer</span>
                <span className="font-data font-semibold text-ink">{montant.toLocaleString()} FCFA</span>
              </div>
            </div>

            <p className="mb-5 rounded-md bg-safety-400/10 px-3 py-2 text-xs text-safety-600">
              Veuillez vérifier vos informations avant de valider le paiement.
            </p>

            <button
              onClick={valider}
              className="w-full rounded-md bg-[#10B981] py-3 text-sm font-semibold text-white hover:bg-[#0EA271]"
            >
              Valider
            </button>
            <button
              onClick={() => setEtape("infos")}
              className="mt-2 w-full text-center text-xs text-ink/40 hover:text-ink/60"
            >
              ← Modifier
            </button>
          </>
        )}

        {etape === "attente" && (
          <div className="py-4 text-center">
            <MobilePayLogo className="mx-auto mb-5 h-16 w-16 animate-pulse-soft" />
            <h2 className="font-display text-lg font-semibold text-ink">
              Confirmez le paiement sur votre téléphone
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Composez votre code {operateurChoisi?.label} pour valider la transaction de{" "}
              <span className="font-data font-semibold text-ink">{montant.toLocaleString()} FCFA</span>.
            </p>
            <div className="mx-auto mt-5 flex justify-center gap-1.5">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-[#10B981]" />
              <span
                className="h-2 w-2 animate-pulse-soft rounded-full bg-[#10B981]"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="h-2 w-2 animate-pulse-soft rounded-full bg-[#10B981]"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}

        {etape === "confirme" && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center">
              <svg viewBox="0 0 56 56" className="h-14 w-14">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  strokeWidth="4"
                  className="animate-draw-circle stroke-[#10B981]"
                  strokeLinecap="round"
                  strokeDasharray="151"
                />
                <path
                  d="M17 29 L24 36 L40 20"
                  fill="none"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-draw-check stroke-[#10B981]"
                  strokeDasharray="34"
                />
              </svg>
            </div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Paiement MobilePay effectué avec succès
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              {montant.toLocaleString()} FCFA débités via {operateurChoisi?.label}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
