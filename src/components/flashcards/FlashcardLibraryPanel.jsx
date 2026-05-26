import { levelBands, modes } from '../../lib/flashcardSession';

function SetSummaryCard({ selectedSetDefinition, selectedSetMetrics, selectedSubject, setMode }) {
  if (!selectedSetDefinition || !selectedSetMetrics) {
    return (
      <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/25 p-5 text-sm text-slate-300">
        This subject has no JSON set files yet. Add the two level-band files and the index entry to activate it.
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{selectedSubject?.subject}</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{selectedSetDefinition.levelBand}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300 md:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-3">
          <p>{selectedSetDefinition.cardCount} cards</p>
          <p className="mt-1 text-slate-400">Topic size</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p>{selectedSetMetrics.learnedCount}/{selectedSetDefinition.cardCount} learned</p>
          <p className="mt-1 text-slate-400">Progress</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p>{selectedSetMetrics.weakCount} cards left to master</p>
          <p className="mt-1 text-slate-400">Needs review</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p>{selectedSetMetrics.dueCount} due now</p>
          <p className="mt-1 text-slate-400">Scheduled review</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <p>{selectedSetMetrics.newCount} new cards</p>
          <p className="mt-1 text-slate-400">Untouched</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {selectedSetMetrics.dueCount ? (
          <button
            type="button"
            onClick={() => setMode('due-review')}
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Review due cards
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setMode('review-weak')}
          className="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Start review
        </button>
      </div>
    </div>
  );
}

export default function FlashcardLibraryPanel({
  flashcardSets,
  levelBand,
  mode,
  selectedSetDefinition,
  selectedSetMetrics,
  selectedSubject,
  setLevelBand,
  setMode,
  setSubjectId,
  subjectCatalog,
  subjectId,
}) {
  return (
    <section className="order-2 rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur lg:order-1">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Flashcard library</p>
      <h2 className="mt-2 font-display text-3xl text-white">Select level, subject, and mode</h2>

      <div className="mt-6 grid gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">1. Choose level</p>
        <div className="grid grid-cols-2 gap-3">
          {levelBands.map((option) => {
            const exists = flashcardSets.some((set) => set.subjectId === subjectId && set.levelBand === option);

            return (
              <button
                key={option}
                type="button"
                disabled={!exists}
                onClick={() => setLevelBand(option)}
                className={`rounded-2xl px-4 py-3 text-sm transition ${
                  levelBand === option && exists
                    ? 'bg-white text-slate-950'
                    : exists
                      ? 'bg-white/5 text-slate-200 hover:bg-white/10'
                      : 'cursor-not-allowed bg-white/5 text-slate-500'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">2. Choose subject</p>
        <div className="grid grid-cols-2 gap-3">
          {subjectCatalog.map((subject) => {
            const isSelected = subject.id === subjectId;

            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => setSubjectId(subject.id)}
                className={`flex min-h-[5.5rem] items-center rounded-[1.5rem] border p-4 text-left text-sm transition ${
                  isSelected ? 'border-sun/50 bg-white/15' : 'border-white/10 bg-slate-950/20 hover:bg-white/10'
                }`}
              >
                <p className="font-semibold leading-snug text-white">{subject.subject}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">3. Choose mode</p>
        {modes.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={`rounded-[1.5rem] border px-4 py-3 text-left transition ${
              mode === option.id
                ? 'border-coral/40 bg-coral/10 text-white'
                : 'border-white/10 bg-slate-950/20 text-slate-300 hover:bg-white/10'
            }`}
          >
            <p className="font-semibold">{option.label}</p>
            <p className="mt-1 text-sm text-slate-400">{option.description}</p>
          </button>
        ))}
      </div>

      <SetSummaryCard
        selectedSetDefinition={selectedSetDefinition}
        selectedSetMetrics={selectedSetMetrics}
        selectedSubject={selectedSubject}
        setMode={setMode}
      />
    </section>
  );
}
