import { useState } from "react";
import { Link } from "react-router-dom";

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

function CommentCaMarcheModal({ onFermer }: { onFermer: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm animate-overlay-in"
      onClick={onFermer}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl animate-modal-pop overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Comment ça marche</h2>
          <button
            onClick={onFermer}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink/70"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-ink/10">
            <div className="h-1.5 bg-safety-500" />
            <div className="p-5">
              <img
                src="/images/bouteille-gaz.png"
                alt="Bouteille de gaz ProxiGaz"
                className="mb-3 h-16 w-auto"
              />
              <h3 className="font-display text-base font-semibold text-ink">Bouteille de gaz</h3>
              <p className="mt-2 text-sm text-ink/60">
                Choisissez votre marque et votre taille (B6, B12, B18...), indiquez votre adresse,
                et une boutique partenaire proche de chez vous confirme et livre votre commande.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-ink/10">
            <div className="h-1.5 bg-gaz-500" />
            <div className="p-5">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gaz-400/15 text-gaz-500">
                <IconePoubelle />
              </div>
              <h3 className="font-display text-base font-semibold text-ink">Ramassage d'ordures</h3>
              <p className="mt-2 text-sm text-ink/60">
                Lancez une demande de ramassage, et le premier ramasseur disponible dans votre
                zone — particulier ou société — l'accepte et vient récupérer vos poubelles.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/commander-gaz"
            onClick={onFermer}
            className="rounded-md bg-safety-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-safety-600"
          >
            Commander du gaz
          </Link>
          <Link
            to="/demander-ramassage"
            onClick={onFermer}
            className="rounded-md bg-gaz-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-gaz-600"
          >
            Demander un ramassage
          </Link>
        </div>

        <div className="mt-8 border-t border-ink/10 pt-6 text-center">
          <h3 className="font-display text-base font-semibold text-ink">
            Boutique de gaz, livreur, ou ramasseur ?
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-ink/60">
            Rejoignez le réseau ProxiGaz et gérez vos commandes, vos livraisons ou vos
            ramassages depuis votre espace dédié.
          </p>
          <Link
            to="/pro"
            onClick={onFermer}
            className="mt-4 inline-block rounded-md bg-steel-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-steel-600"
          >
            Accéder à mon espace professionnel
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const [modalOuvert, setModalOuvert] = useState(false);

  return (
    <div>
      <section className="relative overflow-hidden bg-panel px-6 pb-10 pt-14 text-white sm:pb-0 sm:pt-0">
        <div className="mx-auto grid max-w-5xl items-center gap-8 sm:grid-cols-2 sm:py-20">
          <div className="text-center sm:text-left">
            <div className="animate-fade-in font-display text-4xl font-bold tracking-tight sm:text-5xl">
              PROXI<span className="text-safety-400">GAZ</span>
            </div>
            <p
              className="mt-4 animate-fade-in text-lg text-white/70"
              style={{ animationDelay: "0.1s" }}
            >
              Fini la corvée du gaz. Fini les ordures qui s'entassent.
            </p>

            <div
              className="mt-8 flex animate-fade-in flex-wrap items-center justify-center gap-3 sm:justify-start"
              style={{ animationDelay: "0.2s" }}
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

            <button
              onClick={() => setModalOuvert(true)}
              className="mt-5 inline-flex animate-fade-in items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
              style={{ animationDelay: "0.28s" }}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15 text-[10px]">
                ?
              </span>
              Comment ça marche
            </button>
          </div>

          <div className="relative order-first sm:order-none sm:self-end">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 rounded-full bg-safety-500/10 blur-3xl" />
            <img
              src="/images/livreur.png"
              alt="Livreur ProxiGaz avec une bouteille de gaz"
              className="relative mx-auto h-[280px] w-auto animate-fade-in object-contain sm:h-[420px]"
              style={{ animationDelay: "0.15s" }}
            />
          </div>
        </div>
      </section>

      {modalOuvert && <CommentCaMarcheModal onFermer={() => setModalOuvert(false)} />}
    </div>
  );
}
