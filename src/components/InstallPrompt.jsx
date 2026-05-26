import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setPromptEvent(event);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!promptEvent || dismissed) {
    return null;
  }

  async function handleInstall() {
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === 'accepted') {
      setPromptEvent(null);
      return;
    }

    setDismissed(true);
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[1.5rem] border border-sea/30 bg-sea/10 p-4 text-sm text-teal-50 sm:flex-row sm:items-center sm:justify-between">
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
  );
}
