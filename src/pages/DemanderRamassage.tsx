import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpcMutation } from "../lib/api";
import { Card } from "../components/Card";
import { AddressPicker, AdresseChoisie } from "../components/AddressPicker";
import { SuccessModal } from "../components/SuccessModal";
import { AccountBenefits } from "../components/AccountBenefits";
import { MobilePayLogo } from "../components/MobilePayLogo";
import { MobilePayCheckout, InfosPaiementMobilePay } from "../components/MobilePayCheckout";
import { useAuth } from "../lib/auth";
import { WastePickupIllustration } from "../components/WastePickupIllustration";

const TYPES_DECHET = [
  { value: "menager", label: "Ménager" },
  { value: "encombrant", label: "Encombrant" },
  { value: "recyclable", label: "Recyclable" },
];

type Etape = "demande" | "paiement";
type ModePaiement = "especes" | "mobilepay";

const LABELS_OPERATEURS: Record<string, string> = {
  orange_money: "Orange Money",
  wave: "Wave",
  mtn_money: "MTN Money",
  moov_money: "Moov Money",
};

export function DemanderRamassage() {
  const navigate = useNavigate();
  const { user, definirSession } = useAuth();

  const [etape, setEtape] = useState<Etape>("demande");

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [ville, setVille] = useState("Abidjan");
  const [commune, setCommune] = useState("");
  const [typeDechet, setTypeDechet] = useState("menager");
  const [quantiteEstimee, setQuantiteEstimee] = useState("");
  const [montantPropose, setMontantPropose] = useState<number>(1000);
  const [notes, setNotes] = useState("");
  const [creerCompte, setCreerCompte] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");

  const [modePaiement, setModePaiement] = useState<ModePaiement | null>(null);
  const [checkoutMobilePayOuvert, setCheckoutMobilePayOuvert] = useState(false);

  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [succes, setSucces] = useState(false);

  function passerAuPaiement() {
    if (!adresse || !ville) return;
    if (!user && (!nom || !telephone)) {
      setErreur("Nom et téléphone requis pour continuer");
      return;
    }
    if (!user && creerCompte && motDePasse.length > 0 && motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setErreur(null);
    setEtape("paiement");
  }

  async function finaliserDemande(
    mentionPaiement: string,
    modePaiementBackend: "mobile_money" | "especes_livraison"
  ) {
    setEnvoiEnCours(true);
    setErreur(null);
    try {
      const resultat = await trpcMutation<{
        demande: { id: string };
        token?: string;
        user?: { id: string; nom: string; role: "client" };
      }>("ramassage.creerDemande", {
        adresse,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        ville,
        commune: commune || undefined,
        typeDechet,
        quantiteEstimee: quantiteEstimee || undefined,
        prixPropose: montantPropose,
        modePaiement: modePaiementBackend,
        notes: [notes, mentionPaiement].filter(Boolean).join(" — ") || undefined,
        ...(!user && {
          nomClient: nom,
          telephoneClient: telephone,
          motDePasseClient: creerCompte && motDePasse ? motDePasse : undefined,
        }),
      });

      if (resultat.token && resultat.user) {
        definirSession(resultat.token, resultat.user);
      }

      setSucces(true);
      setTimeout(() => navigate("/mes-commandes"), 2200);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la demande");
      setEnvoiEnCours(false);
    }
  }

  function validerPaiement() {
    if (!modePaiement) return;
    if (modePaiement === "especes") {
      finaliserDemande("Paiement : espèces à la remise", "especes_livraison");
      return;
    }
    setCheckoutMobilePayOuvert(true);
  }

  function apresPaiementMobilePay(infos: InfosPaiementMobilePay) {
    setCheckoutMobilePayOuvert(false);
    finaliserDemande(
      `Paiement : MobilePay (simulé) — ${LABELS_OPERATEURS[infos.operateur]} — ${infos.numeroCompte} — ${infos.nomPayeur}`,
      "mobile_money"
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {etape === "demande" && (
        <WastePickupIllustration className="mb-4 h-32 w-full animate-fade-in sm:h-40" />
      )}

      <div className="mb-6 flex items-center gap-2 text-xs">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
            etape === "demande" ? "bg-gaz-500 text-white" : "bg-gaz-500 text-white"
          }`}
        >
          {etape === "demande" ? "1" : "✓"}
        </div>
        <div className="h-px w-6 bg-ink/10" />
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
            etape === "paiement" ? "bg-safety-500 text-white" : "bg-ink/10 text-ink/40"
          }`}
        >
          2
        </div>
        <span className="ml-2 text-ink/50">
          {etape === "demande" ? "Détails du ramassage" : "Mode de paiement"}
        </span>
      </div>

      {etape === "demande" && (
        <>
          <h1 className="font-display text-2xl font-semibold text-ink">Demander un ramassage</h1>
          <p className="mt-1 text-sm text-ink/60">
            Le premier ramasseur disponible dans votre zone acceptera votre demande.
          </p>

          {erreur && (
            <div className="mt-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
          )}

          <Card className="mt-6 animate-slide-up p-6">
            {!user && (
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink/70">Nom et prénoms</label>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink/70">Téléphone</label>
                  <input
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="0700000000"
                    className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                    required
                  />
                </div>
              </div>
            )}

            <label className="mb-2 block text-sm font-medium text-ink/70">Adresse</label>
            <div className="mb-4">
              <AddressPicker
                valeur={adresse}
                onChange={(a: AdresseChoisie) => {
                  setAdresse(a.adresse);
                  setLatitude(a.latitude);
                  setLongitude(a.longitude);
                }}
              />
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink/70">Ville</label>
                <input
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-ink/70">Commune</label>
                <input
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="Cocody..."
                  className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                />
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-ink/70">Type de déchet</label>
            <div className="mb-5 flex gap-2">
              {TYPES_DECHET.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTypeDechet(t.value)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    typeDechet === t.value
                      ? "bg-steel-500 text-white"
                      : "bg-ink/5 text-ink/60 hover:bg-ink/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-sm font-medium text-ink/70">
              Quantité estimée (optionnel)
            </label>
            <input
              value={quantiteEstimee}
              onChange={(e) => setQuantiteEstimee(e.target.value)}
              placeholder="1 sac, plusieurs sacs, encombrants..."
              className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
            />

            <label className="mb-1 block text-sm font-medium text-ink/70">
              Repères pour vous trouver (recommandé)
            </label>
            <p className="mb-2 text-xs text-ink/50">
              Décrivez votre position réelle en quelques mots (portail de quelle couleur, à côté
              de quel commerce, quel étage...). Si la carte n'est pas exacte, c'est ce qui
              permettra au ramasseur de vous trouver sans problème.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex : portail vert, juste après la pharmacie, 2ème étage porte de gauche"
              className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
            />

            <label className="mb-2 block text-sm font-medium text-ink/70">
              Montant proposé pour ce service (FCFA)
            </label>
            <input
              type="number"
              min={0}
              value={montantPropose}
              onChange={(e) => setMontantPropose(Number(e.target.value))}
              className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
              required
            />

            {!user && (
              <div className="mb-5">
                <AccountBenefits />
                <div className="rounded-md bg-ink/5 p-3">
                  <label className="flex items-center gap-2 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={creerCompte}
                      onChange={(e) => setCreerCompte(e.target.checked)}
                    />
                    Créer un compte pour retrouver mes demandes plus tard (optionnel)
                  </label>
                  {creerCompte && (
                    <>
                      <input
                        type="password"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        placeholder="Choisissez un mot de passe"
                        minLength={6}
                        className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                      />
                      <p
                        className={`mt-1 text-xs ${
                          motDePasse.length > 0 && motDePasse.length < 6 ? "text-valve-500" : "text-ink/40"
                        }`}
                      >
                        Au moins 6 caractères
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={passerAuPaiement}
              disabled={
                !adresse ||
                !ville ||
                !montantPropose ||
                (!user && (!nom || !telephone)) ||
                (!user && creerCompte && motDePasse.length > 0 && motDePasse.length < 6)
              }
              className="w-full rounded-md bg-gaz-500 py-3 text-sm font-semibold text-white hover:bg-gaz-600 disabled:opacity-50"
            >
              Continuer vers le paiement
            </button>
          </Card>
        </>
      )}

      {etape === "paiement" && (
        <div>
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">Ramassage — {typeDechet}</span>
              <span className="font-data font-semibold text-ink">
                {montantPropose.toLocaleString()} FCFA
              </span>
            </div>
          </Card>

          {erreur && (
            <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
          )}

          <Card className="p-6">
            <p className="mb-3 text-sm font-medium text-ink/70">Comment souhaitez-vous payer ?</p>

            <div className="mb-5 space-y-3">
              <button
                onClick={() => setModePaiement("especes")}
                className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
                  modePaiement === "especes"
                    ? "border-steel-500 bg-steel-500/5"
                    : "border-ink/10 hover:border-ink/20"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 text-lg">
                  💵
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">Espèces à la remise</div>
                  <div className="text-xs text-ink/50">Payez le ramasseur directement</div>
                </div>
              </button>

              <button
                onClick={() => setModePaiement("mobilepay")}
                className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
                  modePaiement === "mobilepay"
                    ? "border-[#10B981] bg-[#10B981]/5"
                    : "border-ink/10 hover:border-ink/20"
                }`}
              >
                <MobilePayLogo className="h-10 w-10 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-ink">MobilePay</div>
                  <div className="text-xs text-ink/50">Paiement mobile instantané et sécurisé</div>
                </div>
              </button>
            </div>

            <button
              onClick={validerPaiement}
              disabled={!modePaiement || envoiEnCours}
              className={`w-full rounded-md py-3 text-sm font-semibold text-white disabled:opacity-50 ${
                modePaiement === "mobilepay" ? "bg-[#10B981] hover:bg-[#0EA271]" : "bg-gaz-500 hover:bg-gaz-600"
              }`}
            >
              {envoiEnCours
                ? "Traitement..."
                : modePaiement === "mobilepay"
                ? "Continuer avec MobilePay"
                : "Envoyer la demande"}
            </button>

            <button
              onClick={() => setEtape("demande")}
              className="mt-3 w-full text-center text-xs text-ink/40 hover:text-ink/60"
            >
              ← Retour
            </button>
          </Card>
        </div>
      )}

      {checkoutMobilePayOuvert && (
        <MobilePayCheckout
          typeService={`Ramassage — ${typeDechet}`}
          nomSuggere={user?.nom ?? nom}
          telephoneSuggere={telephone}
          montantSuggere={montantPropose}
          onTermine={apresPaiementMobilePay}
          onAnnuler={() => setCheckoutMobilePayOuvert(false)}
        />
      )}

      {succes && (
        <SuccessModal
          titre="Demande envoyée !"
          sousTitre="Le premier ramasseur disponible dans votre zone va l'accepter."
          couleur="gaz"
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-gaz-400/15">
            <div className="h-full w-full origin-left animate-[shrink_2.2s_linear_both] bg-gaz-500" />
          </div>
          <p className="mt-3 text-xs text-ink/40">Redirection vers mes commandes...</p>
        </SuccessModal>
      )}
    </div>
  );
}
