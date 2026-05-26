import { useEffect, useMemo, useState } from 'react';

function isIosDevice() {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setPromptEvent(event);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setPromptEvent(null);
      setShowHelp(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const iosDevice = useMemo(() => isIosDevice(), []);
  const canShowPrompt = !dismissed && !isInstalled && (promptEvent || iosDevice);

  if (!canShowPrompt) {
    return null;
  }

  async function handleInstall() {
    if (promptEvent) {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        setPromptEvent(null);
        return;
      }
    }

    setShowHelp(true);
  }

  return (
    <div className="mt-4 rounded-[1.5rem] border border-sea/30 bg-sea/10 p-4 text-sm text-teal-50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Install Porto Pal on your phone for faster access and an app-like home screen shortcut.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl bg-white px-4 py-2 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Install
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-xl bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/15"
          >
            Not now
          </button>
        </div>
      </div>

      {showHelp ? (
        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/35 p-4 text-slate-100">
          {iosDevice ? (
            <p>
              On iPhone or iPad, tap the browser share button and choose <strong>Add to Home Screen</strong>.
            </p>
          ) : (
            <p>
              If the install prompt did not open, use your browser menu and choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
