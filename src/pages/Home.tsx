import { Link } from "react-router-dom";

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-panel px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            PROXI<span className="text-safety-400">GAZ</span>
          </div>
          <p className="mt-4 text-lg text-white/70">
            Votre bouteille de gaz livrée chez vous. Votre poubelle ramassée en un clic.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/50">
            Fini les longs trajets avec une bouteille vide en main — commandez votre recharge de
            gaz et un ramassage de poubelle depuis votre téléphone, à Abidjan et environs.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/commander-gaz"
              className="rounded-md bg-safety-500 px-6 py-3 text-sm font-semibold text-white hover:bg-safety-600"
            >
              Commander du gaz
            </Link>
            <Link
              to="/demander-ramassage"
              className="rounded-md bg-gaz-500 px-6 py-3 text-sm font-semibold text-white hover:bg-gaz-600"
            >
              Demander un ramassage
            </Link>
            <Link
              to="/pro"
              className="rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
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
          <div className="rounded-xl border border-ink/10 bg-white p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-safety-400/15 font-display text-lg font-bold text-safety-500">
              1
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">Bouteille de gaz</h3>
            <p className="mt-2 text-sm text-ink/60">
              Choisissez votre marque et votre taille (B6, B12, B18...), indiquez votre adresse,
              et une boutique partenaire proche de chez vous confirme et livre votre commande.
            </p>
          </div>
          <div className="rounded-xl border border-ink/10 bg-white p-6">
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
            className="mt-6 inline-block rounded-md bg-steel-500 px-6 py-3 text-sm font-semibold text-white hover:bg-steel-600"
          >
            Accéder à mon espace professionnel
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink/10 px-6 py-8 text-center text-xs text-ink/40">
        ProxiGaz — un service Compagnie des Services Numériques (CSN) — Abidjan, Côte d'Ivoire
      </footer>
    </div>
  );
}
