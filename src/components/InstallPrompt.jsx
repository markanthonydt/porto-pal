import { useEffect, useMemo, useState } from 'react';

const INSTALL_PROMPT_DISMISSED_KEY = 'porto-pal-install-dismissed-at';
const INSTALL_PROMPT_DISMISS_DAYS = 7;

function isIosDevice() {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

function isMobileDevice() {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod/.test(userAgent);
}

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function wasDismissedRecently() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const dismissedAt = window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY);

    if (!dismissedAt) {
      return false;
    }

    const timestamp = new Date(dismissedAt).getTime();

    if (Number.isNaN(timestamp)) {
      return false;
    }

    const elapsed = Date.now() - timestamp;
    return elapsed < INSTALL_PROMPT_DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, new Date().toISOString());
  } catch {
    // Ignore storage failures; dismissal will still last for the session.
  }
}

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [dismissed, setDismissed] = useState(() => wasDismissedRecently());
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
  const mobileDevice = useMemo(() => isMobileDevice(), []);
  const canShowPrompt = mobileDevice && !dismissed && !isInstalled && (promptEvent || iosDevice);

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

  function handleDismiss() {
    rememberDismissal();
    setDismissed(true);
  }

  return (
    <div className="mt-4 rounded-[1.5rem] border border-sea/30 bg-sea/10 p-4 text-sm text-teal-50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Install Porto Pal on your phone.</p>
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
            onClick={handleDismiss}
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
