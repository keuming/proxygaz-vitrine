import { Link } from "react-router-dom";

function BouteilleFlottante({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={`animate-float ${className}`}
      style={{ animationDelay: "0.3s" }}
    >
      <rect x="66" y="30" width="28" height="14" rx="3" fill="#5B93AC" />
      <rect x="72" y="20" width="16" height="10" rx="2" fill="#5B93AC" />
      <path
        d="M 56 56 Q 56 44 80 44 Q 104 44 104 56 L 104 122 Q 104 136 80 136 Q 56 136 56 122 Z"
        fill="#D4661E"
      />
      <rect x="56" y="86" width="48" height="9" fill="#14232B" opacity="0.15" />
    </svg>
  );
}

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-panel px-6 py-20 text-white">
        <BouteilleFlottante className="pointer-events-none absolute -right-4 top-8 hidden w-32 opacity-80 sm:block" />
        <BouteilleFlottante className="pointer-events-none absolute -left-8 bottom-4 hidden w-20 opacity-40 sm:block" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="animate-fade-in font-display text-4xl font-bold tracking-tight sm:text-5xl">
            PROXI<span className="text-safety-400">GAZ</span>
          </div>
          <p className="mt-4 animate-fade-in text-lg text-white/70" style={{ animationDelay: "0.1s" }}>
            Votre bouteille de gaz livrée chez vous. Votre poubelle ramassée en un clic.
          </p>
          <p
            className="mx-auto mt-2 max-w-xl animate-fade-in text-sm text-white/50"
            style={{ animationDelay: "0.2s" }}
          >
            Fini les longs trajets avec une bouteille vide en main — commandez votre recharge de
            gaz et un ramassage de poubelle depuis votre téléphone, à Abidjan et environs.
          </p>

          <div
            className="mt-8 flex animate-fade-in flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              to="/commander-gaz"
              className="rounded-md bg-safety-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-safety-600"
            >
              Commander du gaz
            </Link>
            <Link
              to="/demander-ramassage"
              className="rounded-md bg-gaz-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-gaz-600"
            >
              Demander un ramassage
            </Link>
            <Link
              to="/pro"
              className="rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition-all hover:scale-105 hover:bg-white/10"
            >
              Espace professionnel
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center font-display text-2xl font-semibold text-ink">
          Comment ça marche
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div className="animate-slide-up rounded-xl border border-ink/10 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-safety-400/15 font-display text-lg font-bold text-safety-500">
              1
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">Bouteille de gaz</h3>
            <p className="mt-2 text-sm text-ink/60">
              Choisissez votre marque et votre taille (B6, B12, B18...), indiquez votre adresse,
              et une boutique partenaire proche de chez vous confirme et livre votre commande.
            </p>
          </div>
          <div
            className="animate-slide-up rounded-xl border border-ink/10 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gaz-400/15 font-display text-lg font-bold text-gaz-500">
              2
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">Ramassage d'ordures</h3>
            <p className="mt-2 text-sm text-ink/60">
              Lancez une demande de ramassage, et le premier ramasseur disponible dans votre
              zone — particulier ou société — l'accepte et vient récupérer vos poubelles.
            </p>
          </div>
        </div>
      </section>

      {/* Pour les professionnels */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Boutique de gaz, livreur, ou ramasseur ?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink/60">
            Rejoignez le réseau ProxiGaz et gérez vos commandes, vos livraisons ou vos
            ramassages depuis votre espace dédié.
          </p>
          <Link
            to="/pro"
            className="mt-6 inline-block rounded-md bg-steel-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-steel-600"
          >
            Accéder à mon espace professionnel
          </Link>
        </div>
      </section>
    </div>
  );
}
