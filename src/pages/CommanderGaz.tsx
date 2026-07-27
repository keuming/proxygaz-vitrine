import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpcQuery, trpcMutation } from "../lib/api";
import { Card } from "../components/Card";
import { AddressPicker, AdresseChoisie } from "../components/AddressPicker";
import { SuccessModal } from "../components/SuccessModal";
import { AccountBenefits } from "../components/AccountBenefits";
import { MobilePayLogo } from "../components/MobilePayLogo";
import { MobilePayCheckout, InfosPaiementMobilePay } from "../components/MobilePayCheckout";
import { useAuth } from "../lib/auth";
import { GasDeliveryIllustration } from "../components/GasDeliveryIllustration";

interface Produit {
  id: string;
  nom: string;
  taille: string;
  prixRecharge: string;
  totalDisponible: number;
  nbBoutiques: number;
}

interface ArticlePanier {
  produit: Produit;
  quantite: number;
}

type Etape = "produits" | "livraison" | "paiement";
type ModePaiement = "especes" | "mobilepay";

const ETAPES_LABELS: Record<Etape, string> = {
  produits: "Choisissez votre bouteille",
  livraison: "Informations de livraison",
  paiement: "Mode de paiement",
};

export function CommanderGaz() {
  const navigate = useNavigate();
  const { user, definirSession } = useAuth();

  const [etape, setEtape] = useState<Etape>("produits");
  const [produits, setProduits] = useState<Produit[]>([]);
  const [panier, setPanier] = useState<ArticlePanier | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [creerCompte, setCreerCompte] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");

  const [modePaiement, setModePaiement] = useState<ModePaiement | null>(null);
  const [checkoutMobilePayOuvert, setCheckoutMobilePayOuvert] = useState(false);

  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    trpcQuery<Produit[]>("gaz.catalogueDisponibilite")
      .then(setProduits)
      .catch((e) => setErreur(e.message));
  }, []);

  function ajouterAuPanier(produit: Produit, quantite: number) {
    setPanier({ produit, quantite });
    setEtape("livraison");
  }

  function majQuantitePanier(delta: number) {
    if (!panier) return;
    const nouvelleQuantite = Math.max(1, Math.min(panier.produit.totalDisponible, panier.quantite + delta));
    setPanier({ ...panier, quantite: nouvelleQuantite });
  }

  function passerAuPaiement() {
    if (!adresse) return;
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

  async function finaliserCommande(mentionPaiement: string, modePaiementBackend: "mobile_money" | "especes_livraison") {
    if (!panier || !adresse) return;

    setEnvoiEnCours(true);
    setErreur(null);
    try {
      const notesAvecPaiement = [notes, mentionPaiement].filter(Boolean).join(" — ");

      const resultat = await trpcMutation<{
        commande: { id: string };
        token?: string;
        user?: { id: string; nom: string; role: "client" };
      }>("gaz.creerCommande", {
        marqueGazId: panier.produit.id,
        quantite: panier.quantite,
        adresseLivraison: adresse,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        notes: notesAvecPaiement || undefined,
        modePaiement: modePaiementBackend,
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
      setTimeout(() => navigate(`/commande/${resultat.commande.id}`), 2200);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la commande");
      setEnvoiEnCours(false);
    }
  }

  function validerPaiement() {
    if (!modePaiement) return;

    if (modePaiement === "especes") {
      finaliserCommande("Paiement : espèces à la livraison", "especes_livraison");
      return;
    }

    setCheckoutMobilePayOuvert(true);
  }

  const LABELS_OPERATEURS: Record<string, string> = {
    orange_money: "Orange Money",
    wave: "Wave",
    mtn_money: "MTN Money",
    moov_money: "Moov Money",
  };

  function apresPaiementMobilePay(infos: InfosPaiementMobilePay) {
    setCheckoutMobilePayOuvert(false);
    finaliserCommande(
      `Paiement : MobilePay (simulé) — ${LABELS_OPERATEURS[infos.operateur]} — ${infos.numeroCompte} — ${infos.nomPayeur}`,
      "mobile_money"
    );
  }

  const prixTotal = panier ? Number(panier.produit.prixRecharge) * panier.quantite : 0;
  const ETAPES_ORDRE: Etape[] = ["produits", "livraison", "paiement"];
  const indexEtape = ETAPES_ORDRE.indexOf(etape);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 pb-28">
      {etape === "produits" && (
        <GasDeliveryIllustration className="mb-4 h-32 w-full animate-fade-in sm:h-40" />
      )}

      <div className="mb-6 flex items-center gap-2 text-xs">
        {ETAPES_ORDRE.map((e, i) => (
          <div key={e} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
                i === indexEtape
                  ? "bg-safety-500 text-white"
                  : i < indexEtape
                  ? "bg-gaz-500 text-white"
                  : "bg-ink/10 text-ink/40"
              }`}
            >
              {i < indexEtape ? "✓" : i + 1}
            </div>
            {i < ETAPES_ORDRE.length - 1 && <div className="h-px w-4 bg-ink/10" />}
          </div>
        ))}
        <span className="ml-2 text-ink/50">{ETAPES_LABELS[etape]}</span>
      </div>

      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      {etape === "produits" && (
        <div className="space-y-3">
          {produits.length === 0 ? (
            <p className="text-sm text-ink/40">Aucun produit disponible pour le moment.</p>
          ) : (
            produits.map((p, i) => {
              const enRupture = p.totalDisponible === 0;
              return (
                <Card
                  key={p.id}
                  className={`animate-slide-up p-4 ${enRupture ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-md"}`}
                  style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-base font-semibold text-ink">
                        {p.nom} — {p.taille}
                      </div>
                      <div className="text-xs text-ink/50">
                        {enRupture ? (
                          <span className="text-valve-500">Rupture de stock</span>
                        ) : (
                          `Disponible dans ${p.nbBoutiques} boutique(s)`
                        )}
                      </div>
                      <div className="mt-1 font-data text-sm font-semibold text-ink">
                        {Number(p.prixRecharge).toLocaleString()} FCFA
                      </div>
                    </div>
                    <button
                      onClick={() => ajouterAuPanier(p, 1)}
                      disabled={enRupture}
                      className="rounded-md bg-safety-500 px-4 py-2 text-xs font-semibold text-white hover:bg-safety-600 disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {etape === "livraison" && panier && (
        <div>
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">
                  {panier.produit.nom} — {panier.produit.taille}
                </div>
                <button
                  onClick={() => setEtape("produits")}
                  className="text-xs text-steel-500 hover:underline"
                >
                  Changer de produit
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => majQuantitePanier(-1)}
                  className="h-7 w-7 rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10"
                >
                  −
                </button>
                <span className="w-6 text-center font-data text-sm">{panier.quantite}</span>
                <button
                  onClick={() => majQuantitePanier(1)}
                  className="h-7 w-7 rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10"
                >
                  +
                </button>
              </div>
            </div>
          </Card>

          <Card className="animate-slide-up p-6">
            {!user && (
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink/70">Nom et prénoms</label>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink/70">Téléphone</label>
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

            <label className="mb-2 block text-sm font-medium text-ink/70">Adresse de livraison</label>
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

            <label className="mb-1 block text-sm font-medium text-ink/70">
              Repères pour vous trouver (recommandé)
            </label>
            <p className="mb-2 text-xs text-ink/50">
              Décrivez votre position réelle en quelques mots (portail de quelle couleur, à côté
              de quel commerce, quel étage...). Si la carte n'est pas exacte, c'est ce qui
              permettra au livreur de vous trouver sans problème.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex : portail vert, juste après la pharmacie, 2ème étage porte de gauche"
              className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
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
                    Créer un compte pour retrouver mes commandes plus tard (optionnel)
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

            <div className="mb-5 flex items-center justify-between rounded-md bg-ink/5 px-4 py-3">
              <span className="text-sm text-ink/60">Total</span>
              <span className="font-data text-lg font-semibold text-ink">
                {prixTotal.toLocaleString()} FCFA
              </span>
            </div>

            <button
              onClick={passerAuPaiement}
              disabled={
                !adresse ||
                (!user && (!nom || !telephone)) ||
                (!user && creerCompte && motDePasse.length > 0 && motDePasse.length < 6)
              }
              className="w-full rounded-md bg-safety-500 py-3 text-sm font-semibold text-white hover:bg-safety-600 disabled:opacity-50"
            >
              Continuer vers le paiement
            </button>
          </Card>
        </div>
      )}

      {etape === "paiement" && panier && (
        <div>
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/60">
                {panier.quantite} × {panier.produit.nom} — {panier.produit.taille}
              </span>
              <span className="font-data font-semibold text-ink">
                {prixTotal.toLocaleString()} FCFA
              </span>
            </div>
          </Card>

          <Card className="animate-slide-up p-6">
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
                  <div className="text-sm font-semibold text-ink">Espèces à la livraison</div>
                  <div className="text-xs text-ink/50">Payez le livreur directement</div>
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

            {modePaiement === "mobilepay" && (
              <p className="mb-5 animate-fade-in text-xs text-ink/50">
                Vous serez invité à choisir votre opérateur (Orange Money, Wave, MTN Money, Moov
                Money) et à confirmer vos informations à l'étape suivante.
              </p>
            )}

            <button
              onClick={validerPaiement}
              disabled={!modePaiement || envoiEnCours}
              className={`w-full rounded-md py-3 text-sm font-semibold text-white disabled:opacity-50 ${
                modePaiement === "mobilepay" ? "bg-[#10B981] hover:bg-[#0EA271]" : "bg-safety-500 hover:bg-safety-600"
              }`}
            >
              {envoiEnCours
                ? "Traitement..."
                : modePaiement === "mobilepay"
                ? "Continuer avec MobilePay"
                : "Confirmer la commande"}
            </button>

            <button
              onClick={() => setEtape("livraison")}
              className="mt-3 w-full text-center text-xs text-ink/40 hover:text-ink/60"
            >
              ← Retour
            </button>
          </Card>
        </div>
      )}

      {panier && etape === "produits" && (
        <button
          onClick={() => setEtape("livraison")}
          className="fixed left-1/2 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 animate-slide-up items-center justify-between rounded-lg bg-panel px-5 py-4 text-white shadow-xl transition-transform hover:scale-[1.02]"
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <span className="text-sm">
            {panier.quantite} × {panier.produit.nom} — {panier.produit.taille}
          </span>
          <span className="font-data text-sm font-semibold">{prixTotal.toLocaleString()} FCFA →</span>
        </button>
      )}

      {checkoutMobilePayOuvert && panier && (
        <MobilePayCheckout
          typeService={`Bouteille de gaz — ${panier.produit.nom} ${panier.produit.taille}`}
          nomSuggere={user?.nom ?? nom}
          telephoneSuggere={telephone}
          montantSuggere={prixTotal}
          onTermine={apresPaiementMobilePay}
          onAnnuler={() => setCheckoutMobilePayOuvert(false)}
        />
      )}

      {succes && (
        <SuccessModal
          titre="Commande envoyée !"
          sousTitre="La boutique va confirmer votre commande dans un instant."
          couleur="safety"
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-safety-400/15">
            <div className="h-full w-full origin-left animate-[shrink_2.2s_linear_both] bg-safety-500" />
          </div>
          <p className="mt-3 text-xs text-ink/40">Redirection vers le suivi...</p>
        </SuccessModal>
      )}
    </div>
  );
}
