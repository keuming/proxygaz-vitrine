import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { trpcMutation } from "../lib/api";
import { useAuth } from "../lib/auth";

type TypeProfil = "boutique" | "livreur" | "ramasseur";

const CHEMINS_PAR_ROLE: Record<string, string> = {
  boutique: "/pro/boutique",
  livreur: "/pro/livreur",
  ramasseur: "/pro/ramasseur",
};

export function InscriptionPro() {
  const { definirSession } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<TypeProfil>("boutique");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [ville, setVille] = useState("Abidjan");
  const [commune, setCommune] = useState("");
  const [nomBoutique, setNomBoutique] = useState("");
  const [vehicule, setVehicule] = useState("");
  const [zonesCouvertes, setZonesCouvertes] = useState("");
  const [typeRamasseur, setTypeRamasseur] = useState<"particulier" | "societe">("particulier");
  const [nomSociete, setNomSociete] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur(null);
    setMessage(null);

    try {
      if (type === "boutique") {
        const data = await trpcMutation<{
          token: string;
          user: { id: string; nom: string; role: "boutique" };
          message: string;
        }>("auth.inscriptionBoutique", {
          nom,
          telephone,
          motDePasse,
          nomBoutique,
          ville,
          commune: commune || undefined,
        });
        definirSession(data.token, data.user);
        setMessage(data.message);
      } else if (type === "livreur") {
        const data = await trpcMutation<{
          token: string;
          user: { id: string; nom: string; role: "livreur" };
          message: string;
        }>("auth.inscriptionLivreur", {
          nom,
          telephone,
          motDePasse,
          ville,
          vehicule: vehicule || undefined,
          zonesCouvertes: zonesCouvertes.split(",").map((z) => z.trim()).filter(Boolean),
        });
        definirSession(data.token, data.user);
        setMessage(data.message);
      } else {
        const data = await trpcMutation<{
          token: string;
          user: { id: string; nom: string; role: "ramasseur" };
          message: string;
        }>("auth.inscriptionRamasseur", {
          nom,
          telephone,
          motDePasse,
          ville,
          type: typeRamasseur,
          nomSociete: nomSociete || undefined,
          zonesCouvertes: zonesCouvertes.split(",").map((z) => z.trim()).filter(Boolean),
        });
        definirSession(data.token, data.user);
        setMessage(data.message);
      }

      setTimeout(() => navigate(CHEMINS_PAR_ROLE[type]), 1800);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-panel px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="font-display text-2xl font-bold text-white">
            PROXI<span className="text-safety-400">GAZ</span>
          </div>
          <p className="mt-1 text-sm text-white/60">Inscription professionnelle</p>
        </div>

        <div className="mb-4 flex rounded-lg bg-white/10 p-1">
          {(["boutique", "livreur", "ramasseur"] as TypeProfil[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 rounded-md py-2 text-xs font-medium capitalize transition-colors ${
                type === t ? "bg-white text-ink" : "text-white/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="rounded-lg bg-white p-6 shadow-xl">
          {message ? (
            <div className="rounded-md bg-gaz-400/10 px-4 py-3 text-sm text-gaz-600">{message}</div>
          ) : (
            <>
              <label className="mb-1 block text-sm font-medium text-ink/70">Nom</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                required
              />

              <label className="mb-1 block text-sm font-medium text-ink/70">Téléphone</label>
              <input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="0700000000"
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                required
              />

              <label className="mb-1 block text-sm font-medium text-ink/70">Mot de passe</label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                minLength={6}
                className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                required
              />

              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink/70">Ville</label>
                  <input
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                    required
                  />
                </div>
                {type === "boutique" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink/70">Commune</label>
                    <input
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                    />
                  </div>
                )}
              </div>

              {type === "boutique" && (
                <>
                  <label className="mb-1 block text-sm font-medium text-ink/70">Nom de la boutique</label>
                  <input
                    value={nomBoutique}
                    onChange={(e) => setNomBoutique(e.target.value)}
                    className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                    required
                  />
                </>
              )}

              {type === "livreur" && (
                <>
                  <label className="mb-1 block text-sm font-medium text-ink/70">Véhicule</label>
                  <input
                    value={vehicule}
                    onChange={(e) => setVehicule(e.target.value)}
                    placeholder="moto, tricycle..."
                    className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                  />
                  <label className="mb-1 block text-sm font-medium text-ink/70">
                    Zones couvertes (séparées par des virgules)
                  </label>
                  <input
                    value={zonesCouvertes}
                    onChange={(e) => setZonesCouvertes(e.target.value)}
                    placeholder="Cocody, Marcory"
                    className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                    required
                  />
                </>
              )}

              {type === "ramasseur" && (
                <>
                  <label className="mb-1 block text-sm font-medium text-ink/70">Type</label>
                  <select
                    value={typeRamasseur}
                    onChange={(e) => setTypeRamasseur(e.target.value as "particulier" | "societe")}
                    className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                  >
                    <option value="particulier">Particulier</option>
                    <option value="societe">Société</option>
                  </select>
                  {typeRamasseur === "societe" && (
                    <>
                      <label className="mb-1 block text-sm font-medium text-ink/70">Nom de la société</label>
                      <input
                        value={nomSociete}
                        onChange={(e) => setNomSociete(e.target.value)}
                        className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                      />
                    </>
                  )}
                  <label className="mb-1 block text-sm font-medium text-ink/70">
                    Zones couvertes (séparées par des virgules)
                  </label>
                  <input
                    value={zonesCouvertes}
                    onChange={(e) => setZonesCouvertes(e.target.value)}
                    placeholder="Cocody, Marcory"
                    className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
                    required
                  />
                </>
              )}

              {erreur && (
                <div className="mb-3 rounded-md bg-valve-400/10 px-3 py-2 text-sm text-valve-600">
                  {erreur}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-safety-500 py-2.5 text-sm font-medium text-white hover:bg-safety-600 disabled:opacity-60"
              >
                {loading ? "Création..." : "Créer mon compte professionnel"}
              </button>
            </>
          )}
        </form>

        <p className="mt-4 text-center text-xs text-white/40">
          <Link to="/pro" className="hover:text-white/70">
            ← Déjà inscrit ? Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
