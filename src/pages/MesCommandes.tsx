import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { trpcQuery } from "../lib/api";
import { Card } from "../components/Card";
import { StatusGauge } from "../components/StatusGauge";

interface CommandeGaz {
  id: string;
  quantite: number;
  prixTotal: string;
  adresseLivraison: string;
  statut: string;
  createdAt: string;
}

interface DemandeRamassage {
  id: string;
  adresse: string;
  ville: string;
  typeDechet: string;
  statut: string;
  createdAt: string;
}

export function MesCommandes() {
  const [commandes, setCommandes] = useState<CommandeGaz[]>([]);
  const [demandes, setDemandes] = useState<DemandeRamassage[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    trpcQuery<CommandeGaz[]>("gaz.mesCommandes").then(setCommandes).catch((e) => setErreur(e.message));
    trpcQuery<DemandeRamassage[]>("ramassage.mesDemandesClient")
      .then(setDemandes)
      .catch((e) => setErreur(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Mes commandes</h1>
        <div className="flex gap-2">
          <Link
            to="/commander-gaz"
            className="rounded-md bg-safety-500 px-3 py-2 text-xs font-medium text-white hover:bg-safety-600"
          >
            + Gaz
          </Link>
          <Link
            to="/demander-ramassage"
            className="rounded-md bg-gaz-500 px-3 py-2 text-xs font-medium text-white hover:bg-gaz-600"
          >
            + Ramassage
          </Link>
        </div>
      </div>

      {erreur && (
        <div className="mb-4 rounded-md bg-valve-400/10 px-4 py-3 text-sm text-valve-600">{erreur}</div>
      )}

      <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-ink/50">
        Bouteilles de gaz
      </h2>
      <div className="mb-8 space-y-3">
        {commandes.length === 0 ? (
          <p className="text-sm text-ink/40">Aucune commande de gaz pour le moment.</p>
        ) : (
          commandes.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">{c.adresseLivraison}</div>
                  <div className="text-xs text-ink/50">Quantité : {c.quantite}</div>
                </div>
                <StatusGauge statut={c.statut} />
              </div>
              <div className="font-data text-sm font-semibold text-ink">
                {Number(c.prixTotal).toLocaleString()} FCFA
              </div>
            </Card>
          ))
        )}
      </div>

      <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-ink/50">
        Ramassages
      </h2>
      <div className="space-y-3">
        {demandes.length === 0 ? (
          <p className="text-sm text-ink/40">Aucune demande de ramassage pour le moment.</p>
        ) : (
          demandes.map((d) => (
            <Card key={d.id} className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">
                    {d.adresse} — {d.ville}
                  </div>
                  <div className="text-xs text-ink/50">{d.typeDechet}</div>
                </div>
                <StatusGauge statut={d.statut} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
