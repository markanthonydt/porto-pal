import { useState } from 'react';
import { useProgress } from '../context/ProgressContext';

export default function MistakesPage() {
  const { progress, clearMistakes, resetProgress } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Local history</p>
          <h2 className="mt-2 font-display text-3xl text-white">Phrases you're still learning</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={clearMistakes} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Clear mistakes
          </button>
          {confirmReset ? (
            <div className="flex flex-col gap-2 rounded-[1.25rem] border border-coral/30 bg-coral/10 p-3">
              <p className="text-sm text-orange-100">Reset all progress?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                  }}
                  className="rounded-2xl bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
                >
                  Yes, reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-2xl bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
            >
              Reset all progress
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-4">
        {progress.mistakes.length ? (
          progress.mistakes.map((mistake) => (
            <article key={mistake.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{mistake.mode} / {mistake.subject} / {mistake.levelBand}</p>
                  <p className="mt-3 text-sm text-slate-400">Prompt</p>
                  <p className="text-lg text-white">{mistake.prompt}</p>
                  <p className="mt-3 text-sm text-slate-400">
                    Expected {mistake.expectedLanguage === 'english' ? 'English' : 'Portuguese'}
                  </p>
                  <p className="text-lg font-semibold text-white">{mistake.expected}</p>
                  <p className="mt-3 text-sm text-slate-400">Your answer</p>
                  <p className="text-lg text-orange-200">{mistake.answer || 'No answer recorded'}</p>
                </div>
                <p className="text-sm text-slate-500">{new Date(mistake.createdAt).toLocaleString()}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/15 bg-slate-950/25 p-8 text-center text-sm text-slate-300">
            No mistakes logged yet. Missed flashcards and translation answers will appear here.
          </div>
        )}
      </section>
    </div>
  );
}
