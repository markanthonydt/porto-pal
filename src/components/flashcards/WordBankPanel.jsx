export default function WordBankPanel({ deck, getCardStats, markWordBankCard, selectedSet }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{selectedSet.subject}</p>
          <p className="mt-1 text-sm text-slate-300">{selectedSet.levelBand} / Word bank</p>
        </div>
        <p className="rounded-full bg-slate-950/40 px-4 py-2 text-sm text-slate-200">{deck.length} cards</p>
      </div>

      <div className="mt-6 grid gap-3">
        {deck.map((entry) => {
          const stats = getCardStats(entry.id);
          const hasProgress = stats.correct > 0 || stats.incorrect > 0;
          const needsReview = stats.incorrect > stats.correct || (stats.incorrect > 0 && stats.correct === 0);
          const statusLabel = !hasProgress ? '' : needsReview ? 'Review' : 'Known';
          const statusClasses = !hasProgress
            ? 'bg-white/10 text-slate-400'
            : needsReview
              ? 'bg-coral/20 text-orange-100'
              : 'bg-sea/20 text-teal-100';

          return (
            <article key={entry.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
              <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{entry.portuguese}</p>
                <p className="mt-1 text-sm text-slate-200">{entry.english}</p>
                <p className="mt-1 text-xs text-slate-400">{entry.pronunciationNote}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{entry.grammarFocus}</p>
              </div>
                <p className={`min-w-20 rounded-full px-3 py-1 text-center text-xs ${statusClasses}`}>{statusLabel}</p>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => markWordBankCard(entry, false)}
                  className="flex-1 rounded-2xl bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
                >
                  Mark for review
                </button>
                <button
                  type="button"
                  onClick={() => markWordBankCard(entry, true)}
                  className="flex-1 rounded-2xl bg-sea px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
                >
                  Mark as known
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
