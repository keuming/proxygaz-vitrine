import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { trpcQuery } from "../lib/api";
import { Card } from "../components/Card";

interface Commande {
  id: string;
  quantite: number;
  prixTotal: string;
  adresseLivraison: string;
  statut: string;
  raisonNonLivraison: string | null;
  livreurNom: string | null;
  livreurTelephone: string | null;
}

const ETAPES = [
  { statut: "en_attente", label: "Commande reçue" },
  { statut: "confirmee", label: "En préparation" },
  { statut: "en_livraison", label: "En livraison" },
  { statut: "livree", label: "Livrée" },
];

export function SuiviCommande() {
  const { id } = useParams<{ id: string }>();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    function charger() {
      trpcQuery<Commande[]>("gaz.mesCommandes")
        .then((toutes) => {
          const trouvee = toutes.find((c) => c.id === id);
          if (trouvee) setCommande(trouvee);
          else setErreur("Commande introuvable");
        })
        .catch((e) => setErreur(e.message));
    }

    charger();
    // Suivi en direct : rafraîchit toutes les 5 secondes tant que la commande n'est pas finalisée
    const intervalle = setInterval(charger, 5000);
    return () => clearInterval(intervalle);
  }, [id]);

  if (erreur) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-valve-600">{erreur}</p>
        <Link to="/mes-commandes" className="mt-4 inline-block text-sm text-steel-500 hover:underline">
          Voir mes commandes
        </Link>
      </div>
    );
  }

  if (!commande) {
    return <div className="px-4 py-16 text-center text-sm text-ink/40">Chargement...</div>;
  }

  const estAnnulee = commande.statut === "annulee";
  const estNonLivree = commande.statut === "non_livree";
  const indexActuel = ETAPES.findIndex((e) => e.statut === commande.statut);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Suivi de commande</h1>
      <p className="mb-6 text-sm text-ink/50">{commande.adresseLivraison}</p>

      {estAnnulee ? (
        <Card className="p-6 text-center">
          <div className="mb-1 font-display text-lg font-semibold text-valve-600">Commande annulée</div>
          <p className="text-sm text-ink/60">Cette commande a été annulée.</p>
        </Card>
      ) : estNonLivree ? (
        <Card className="p-6 text-center">
          <div className="mb-1 font-display text-lg font-semibold text-valve-600">
            Livraison non aboutie
          </div>
          {commande.raisonNonLivraison && (
            <p className="text-sm text-ink/60">{commande.raisonNonLivraison}</p>
          )}
        </Card>
      ) : (
        <Card className="animate-scale-in p-6">
          <div className="mb-6 flex items-start justify-between">
            {ETAPES.map((e, i) => {
              const validee = i < indexActuel;
              const active = i === indexActuel;
              return (
                <div key={e.statut} className="flex flex-1 flex-col items-center">
                  <div
                    className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                      i <= indexActuel ? "bg-gaz-500 text-white" : "bg-ink/10 text-ink/40"
                    } ${validee ? "animate-check-pop" : ""} ${active ? "animate-pulse-soft" : ""}`}
                  >
                    {validee ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-center text-[11px] leading-tight transition-colors ${
                      i <= indexActuel ? "font-medium text-ink" : "text-ink/40"
                    }`}
                  >
                    {e.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-px w-full bg-ink/10" />

          {commande.livreurNom && (
            <div className="mt-4 rounded-md bg-steel-500/10 px-4 py-3 text-sm">
              <span className="text-ink/60">Livreur : </span>
              <span className="font-medium text-ink">{commande.livreurNom}</span>
              {commande.livreurTelephone && (
                <span className="text-ink/60"> · {commande.livreurTelephone}</span>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-ink/60">{commande.quantite} bouteille(s)</span>
            <span className="font-data text-base font-semibold text-ink">
              {Number(commande.prixTotal).toLocaleString()} FCFA
            </span>
          </div>
        </Card>
      )}

      <Link to="/mes-commandes" className="mt-6 block text-center text-sm text-steel-500 hover:underline">
        Voir toutes mes commandes
      </Link>
    </div>
  );
}
