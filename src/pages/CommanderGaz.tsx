import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpcQuery, trpcMutation } from "../lib/api";
import { Card } from "../components/Card";
import { AddressPicker, AdresseChoisie } from "../components/AddressPicker";
import { useAuth } from "../lib/auth";

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

type Etape = "produits" | "livraison";

export function CommanderGaz() {
  const navigate = useNavigate();
  const { user, definirSession } = useAuth();

  const [etape, setEtape] = useState<Etape>("produits");
  const [produits, setProduits] = useState<Produit[]>([]);
  const [panier, setPanier] = useState<ArticlePanier | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  // Formulaire de livraison
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [creerCompte, setCreerCompte] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

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

  async function validerCommande() {
    if (!panier || !adresse) return;
    if (!user && (!nom || !telephone)) {
      setErreur("Nom et téléphone requis pour valider la commande");
      return;
    }

    setEnvoiEnCours(true);
    setErreur(null);
    try {
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
        notes: notes || undefined,
        ...(!user && {
          nomClient: nom,
          telephoneClient: telephone,
          motDePasseClient: creerCompte && motDePasse ? motDePasse : undefined,
        }),
      });

      if (resultat.token && resultat.user) {
        definirSession(resultat.token, resultat.user);
      }

      navigate(`/commande/${resultat.commande.id}`);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la commande");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  const prixTotal = panier ? Number(panier.produit.prixRecharge) * panier.quantite : 0;

  return (
    <div className="mx-auto max-w-xl px-4 py-8 pb-28">
      <div className="mb-6 flex items-center gap-2 text-xs">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
            etape === "produits" ? "bg-safety-500 text-white" : "bg-gaz-500 text-white"
          }`}
        >
          {etape === "produits" ? "1" : "✓"}
        </div>
        <div className="h-px w-6 bg-ink/10" />
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
            etape === "livraison" ? "bg-safety-500 text-white" : "bg-ink/10 text-ink/40"
          }`}
        >
          2
        </div>
        <span className="ml-2 text-ink/50">
          {etape === "produits" ? "Choisissez votre bouteille" : "Informations de livraison"}
        </span>
      </div>

      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      {etape === "produits" && (
        <div className="space-y-3">
          {produits.length === 0 ? (
            <p className="text-sm text-ink/40">Aucun produit disponible pour le moment.</p>
          ) : (
            produits.map((p) => {
              const enRupture = p.totalDisponible === 0;
              return (
                <Card key={p.id} className={`p-4 ${enRupture ? "opacity-60" : ""}`}>
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

          <Card className="p-6">
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

            <label className="mb-2 block text-sm font-medium text-ink/70">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mb-4 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
            />

            {!user && (
              <div className="mb-5 rounded-md bg-ink/5 p-3">
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={creerCompte}
                    onChange={(e) => setCreerCompte(e.target.checked)}
                  />
                  Créer un compte pour retrouver mes commandes plus tard (optionnel)
                </label>
                {creerCompte && (
                  <input
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Choisissez un mot de passe"
                    minLength={6}
                    className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                  />
                )}
              </div>
            )}

            <div className="mb-5 flex items-center justify-between rounded-md bg-ink/5 px-4 py-3">
              <span className="text-sm text-ink/60">Total</span>
              <span className="font-data text-lg font-semibold text-ink">
                {prixTotal.toLocaleString()} FCFA
              </span>
            </div>

            <button
              onClick={validerCommande}
              disabled={!adresse || envoiEnCours || (!user && (!nom || !telephone))}
              className="w-full rounded-md bg-safety-500 py-3 text-sm font-semibold text-white hover:bg-safety-600 disabled:opacity-50"
            >
              {envoiEnCours ? "Envoi..." : "Valider la commande"}
            </button>
          </Card>
        </div>
      )}

      {panier && etape === "produits" && (
        <button
          onClick={() => setEtape("livraison")}
          className="fixed bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between rounded-lg bg-panel px-5 py-4 text-white shadow-xl"
        >
          <span className="text-sm">
            {panier.quantite} × {panier.produit.nom} — {panier.produit.taille}
          </span>
          <span className="font-data text-sm font-semibold">{prixTotal.toLocaleString()} FCFA →</span>
        </button>
      )}
    </div>
  );
}
