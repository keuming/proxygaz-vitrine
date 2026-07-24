import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpcQuery, trpcMutation } from "../lib/api";
import { Card } from "../components/Card";
import { AddressPicker, AdresseChoisie } from "../components/AddressPicker";

interface Boutique {
  id: string;
  nomBoutique: string;
  ville: string;
  commune: string | null;
  adresse: string | null;
  nbReferencesDisponibles: number;
}

interface ProduitBoutique {
  marqueId: string;
  nom: string;
  taille: string;
  prixRecharge: string;
  prixConsigne: string | null;
  quantiteDisponible: number;
}

type Etape = "boutique" | "produit" | "confirmation";

export function CommanderGaz() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState<Etape>("boutique");
  const [erreur, setErreur] = useState<string | null>(null);

  // Étape 1 : boutiques
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [boutiqueChoisie, setBoutiqueChoisie] = useState<Boutique | null>(null);

  // Étape 2 : produits de la boutique choisie
  const [produits, setProduits] = useState<ProduitBoutique[]>([]);
  const [produitChoisi, setProduitChoisi] = useState<ProduitBoutique | null>(null);
  const [quantite, setQuantite] = useState(1);

  // Étape 3 : livraison
  const [adresse, setAdresse] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    trpcQuery<Boutique[]>("gaz.boutiquesProches")
      .then(setBoutiques)
      .catch((e) => setErreur(e.message));
  }, []);

  function choisirBoutique(b: Boutique) {
    setBoutiqueChoisie(b);
    setErreur(null);
    trpcQuery<ProduitBoutique[]>("gaz.catalogueBoutique", { boutiqueId: b.id })
      .then(setProduits)
      .catch((e) => setErreur(e.message));
    setEtape("produit");
  }

  function choisirProduit(p: ProduitBoutique) {
    setProduitChoisi(p);
    setQuantite(1);
    setEtape("confirmation");
  }

  async function commander() {
    if (!boutiqueChoisie || !produitChoisi || !adresse) return;
    setEnvoiEnCours(true);
    setErreur(null);
    try {
      const commande = await trpcMutation<{ id: string }>("gaz.creerCommande", {
        marqueGazId: produitChoisi.marqueId,
        boutiqueId: boutiqueChoisie.id,
        quantite,
        adresseLivraison: adresse,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        notes: notes || undefined,
      });
      navigate(`/commande/${commande.id}`);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la commande");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  const prixTotal = produitChoisi ? Number(produitChoisi.prixRecharge) * quantite : 0;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {/* Fil d'ariane façon VTC/livraison */}
      <div className="mb-6 flex items-center gap-2 text-xs">
        {(["boutique", "produit", "confirmation"] as Etape[]).map((e, i) => (
          <div key={e} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (e === "boutique") setEtape("boutique");
                if (e === "produit" && boutiqueChoisie) setEtape("produit");
              }}
              className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
                etape === e
                  ? "bg-safety-500 text-white"
                  : i < ["boutique", "produit", "confirmation"].indexOf(etape)
                  ? "bg-gaz-500 text-white"
                  : "bg-ink/10 text-ink/40"
              }`}
            >
              {i + 1}
            </button>
            {i < 2 && <div className="h-px w-6 bg-ink/10" />}
          </div>
        ))}
        <span className="ml-2 text-ink/50">
          {etape === "boutique" && "Choisissez une boutique"}
          {etape === "produit" && "Choisissez votre bouteille"}
          {etape === "confirmation" && "Confirmez votre commande"}
        </span>
      </div>

      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      {/* Étape 1 : liste des boutiques, façon liste de restaurants */}
      {etape === "boutique" && (
        <div className="space-y-3">
          {boutiques.length === 0 ? (
            <p className="text-sm text-ink/40">Aucune boutique disponible pour le moment.</p>
          ) : (
            boutiques.map((b) => (
              <button key={b.id} onClick={() => choisirBoutique(b)} className="block w-full text-left">
                <Card className="p-4 transition-colors hover:border-steel-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-base font-semibold text-ink">{b.nomBoutique}</div>
                      <div className="text-xs text-ink/50">
                        {b.commune ? `${b.commune}, ` : ""}
                        {b.ville}
                      </div>
                    </div>
                    <span className="rounded-full bg-gaz-400/10 px-3 py-1 text-xs font-medium text-gaz-600">
                      {b.nbReferencesDisponibles} en stock
                    </span>
                  </div>
                </Card>
              </button>
            ))
          )}
        </div>
      )}

      {/* Étape 2 : "menu" de la boutique choisie */}
      {etape === "produit" && boutiqueChoisie && (
        <div>
          <div className="mb-4 text-sm text-ink/60">
            Chez <span className="font-medium text-ink">{boutiqueChoisie.nomBoutique}</span>
          </div>
          <div className="space-y-3">
            {produits.length === 0 ? (
              <p className="text-sm text-ink/40">Aucune bouteille en stock dans cette boutique.</p>
            ) : (
              produits.map((p) => (
                <button
                  key={p.marqueId}
                  onClick={() => choisirProduit(p)}
                  className="block w-full text-left"
                >
                  <Card className="p-4 transition-colors hover:border-steel-400">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-ink">
                          {p.nom} — {p.taille}
                        </div>
                        <div className="text-xs text-ink/50">{p.quantiteDisponible} disponibles</div>
                      </div>
                      <div className="font-data text-sm font-semibold text-ink">
                        {Number(p.prixRecharge).toLocaleString()} FCFA
                      </div>
                    </div>
                  </Card>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Étape 3 : confirmation, façon récapitulatif de commande */}
      {etape === "confirmation" && boutiqueChoisie && produitChoisi && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between border-b border-ink/10 pb-4">
            <div>
              <div className="text-sm font-medium text-ink">
                {produitChoisi.nom} — {produitChoisi.taille}
              </div>
              <div className="text-xs text-ink/50">{boutiqueChoisie.nomBoutique}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantite(Math.max(1, quantite - 1))}
                className="h-7 w-7 rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10"
              >
                −
              </button>
              <span className="w-6 text-center font-data text-sm">{quantite}</span>
              <button
                onClick={() => setQuantite(Math.min(produitChoisi.quantiteDisponible, quantite + 1))}
                className="h-7 w-7 rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10"
              >
                +
              </button>
            </div>
          </div>

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
            className="mb-5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
          />

          <div className="mb-5 flex items-center justify-between rounded-md bg-ink/5 px-4 py-3">
            <span className="text-sm text-ink/60">Total</span>
            <span className="font-data text-lg font-semibold text-ink">
              {prixTotal.toLocaleString()} FCFA
            </span>
          </div>

          <button
            onClick={commander}
            disabled={!adresse || envoiEnCours}
            className="w-full rounded-md bg-safety-500 py-3 text-sm font-semibold text-white hover:bg-safety-600 disabled:opacity-50"
          >
            {envoiEnCours ? "Envoi..." : "Commander"}
          </button>
        </Card>
      )}
    </div>
  );
}
