import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const CLE_MASQUE = "proxigaz_install_masque";

function dejaInstallee(): boolean {
  const standaloneWeb = window.matchMedia("(display-mode: standalone)").matches;
  const standaloneIOS = (window.navigator as any).standalone === true; // Safari iOS
  return standaloneWeb || standaloneIOS;
}

function estIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [evenement, setEvenement] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [modeIOS, setModeIOS] = useState(false);

  useEffect(() => {
    // Si l'app tourne déjà en mode installé (PWA standalone), inutile de proposer l'installation
    if (dejaInstallee()) return;
    if (localStorage.getItem(CLE_MASQUE)) return;

    // Safari iOS ne déclenche JAMAIS l'événement "beforeinstallprompt" — c'est une limitation
    // de la plateforme, pas un bug. La seule option est d'afficher des instructions manuelles.
    if (estIOS()) {
      setModeIOS(true);
      setVisible(true);
      return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setEvenement(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function installer() {
    if (!evenement) return;
    await evenement.prompt();
    setVisible(false);
  }

  function fermer() {
    setVisible(false);
    localStorage.setItem(CLE_MASQUE, "1");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-slide-up items-center justify-between gap-3 rounded-lg bg-panel px-4 py-3 text-white shadow-xl"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      {modeIOS ? (
        <>
          <div className="text-sm">
            <div className="font-medium">Installer ProxiGaz</div>
            <div className="text-xs text-white/60">
              Appuyez sur <span className="font-semibold">Partager</span> <span aria-hidden>⬆️</span>{" "}
              puis <span className="font-semibold">Sur l'écran d'accueil</span>
            </div>
          </div>
          <button onClick={fermer} className="shrink-0 text-xs text-white/50 hover:text-white/80">
            Fermer
          </button>
        </>
      ) : (
        <>
          <div className="text-sm">
            <div className="font-medium">Installer ProxiGaz</div>
            <div className="text-xs text-white/60">Accès rapide depuis votre écran d'accueil</div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={fermer} className="text-xs text-white/50 hover:text-white/80">
              Plus tard
            </button>
            <button
              onClick={installer}
              className="rounded-md bg-safety-500 px-3 py-1.5 text-xs font-semibold hover:bg-safety-600"
            >
              Installer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
