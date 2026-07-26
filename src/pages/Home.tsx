import { Link } from "react-router-dom";
import { DeliveryRoute } from "../components/DeliveryRoute";

function IconeBouteille() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8">
      <rect x="15" y="4" width="10" height="6" rx="2" fill="currentColor" opacity="0.6" />
      <path
        d="M11 14 Q11 9 20 9 Q29 9 29 14 L29 32 Q29 36 20 36 Q11 36 11 32 Z"
        fill="currentColor"
      />
      <rect x="11" y="22" width="18" height="3" fill="black" opacity="0.12" />
    </svg>
  );
}

function IconePoubelle() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8">
      <rect x="9" y="9" width="22" height="4" rx="1.5" fill="currentColor" opacity="0.6" />
      <path d="M12 15 L14 34 Q14 36 17 36 L23 36 Q26 36 26 34 L28 15 Z" fill="currentColor" />
      <rect x="16" y="19" width="2.4" height="12" rx="1.2" fill="black" opacity="0.15" />
      <rect x="21.6" y="19" width="2.4" height="12" rx="1.2" fill="black" opacity="0.15" />
    </svg>
  );
}

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-panel px-6 pb-14 pt-16 text-white sm:pb-20 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in font-display text-4xl font-bold tracking-tight sm:text-5xl">
            PROXI<span className="text-safety-400">GAZ</span>
          </div>
          <p className="mt-4 animate-fade-in text-lg text-white/70" style={{ animationDelay: "0.1s" }}>
            Fini la corvée du gaz. Fini les ordures qui s'entassent.
          </p>
          <p
            className="mx-auto mt-2 max-w-xl animate-fade-in text-sm text-white/50"
            style={{ animationDelay: "0.2s" }}
          >
            Personne ne devrait envoyer un enfant chercher une bouteille de boutique en boutique,
            ni vivre avec des poubelles qui s'accumulent faute de passage. ProxiGaz livre votre gaz
            et ramasse vos ordures, en un clic — où que vous soyez en Afrique.
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
          </div>

          <Link
            to="/pro"
            className="mt-4 inline-block animate-fade-in text-xs text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
            style={{ animationDelay: "0.35s" }}
          >
            Vous êtes boutique, livreur ou ramasseur ? Accédez à votre espace pro →
          </Link>
        </div>

        <div className="mx-auto mt-10 max-w-2xl animate-fade-in" style={{ animationDelay: "0.45s" }}>
          <DeliveryRoute className="w-full" />
          <div className="mt-1 flex justify-between px-4 text-[11px] uppercase tracking-wide text-white/30">
            <span>Boutique</span>
            <span>Chez vous</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center font-display text-2xl font-semibold text-ink">
          Comment ça marche
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="animate-slide-up overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="h-1.5 bg-safety-500" />
            <div className="p-6">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-safety-400/15 text-safety-500">
                <IconeBouteille />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">Bouteille de gaz</h3>
              <p className="mt-2 text-sm text-ink/60">
                Choisissez votre marque et votre taille (B6, B12, B18...), indiquez votre adresse,
                et une boutique partenaire proche de chez vous confirme et livre votre commande.
              </p>
            </div>
          </div>
          <div
            className="animate-slide-up overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="h-1.5 bg-gaz-500" />
            <div className="p-6">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gaz-400/15 text-gaz-500">
                <IconePoubelle />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">Ramassage d'ordures</h3>
              <p className="mt-2 text-sm text-ink/60">
                Lancez une demande de ramassage, et le premier ramasseur disponible dans votre
                zone — particulier ou société — l'accepte et vient récupérer vos poubelles.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-6 py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #16241F 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
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
