import StatCard from '../components/StatCard';
import { useProgress } from '../context/ProgressContext';

export default function DashboardPage() {
  const { progress, metrics } = useProgress();

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's progress" value={`${metrics.answersToday} answers`} hint={`${metrics.todayStats.correct} correct / ${metrics.todayStats.incorrect} incorrect`} tone="sea" />
        <StatCard label="Current streak" value={`${progress.streak} day${progress.streak === 1 ? '' : 's'}`} hint="Any practice on a new day extends the streak." tone="coral" />
        <StatCard label="Cards learned" value={metrics.cardsLearned} hint="Counted after a correct answer." />
        <StatCard label="Accuracy" value={`${metrics.accuracy}%`} hint="Across all subjects you've practiced so far." tone="coral" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Library map</p>
              <h2 className="mt-2 font-display text-3xl text-white">Subject completion</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {metrics.subjects.map((subject) => {
              const percentage = subject.total ? Math.round((subject.learned / subject.total) * 100) : 0;
              return (
                <div key={subject.id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-white">{subject.subject}</p>
                      <p className="text-sm text-slate-400">
                        {subject.loadedSetCount ? `${subject.learned} learned of ${subject.total}` : 'No set files loaded yet'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-300">{subject.loadedSetCount ? `${percentage}%` : 'Pending'}</p>
                  </div>
                  {subject.loadedSetCount ? (
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-sea via-coral to-sun" style={{ width: `${percentage}%` }} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Cards to practice</p>
          <h2 className="mt-2 font-display text-3xl text-white">Review queue</h2>
          <div className="mt-6 grid gap-3">
            {metrics.weakCards.length ? (
              metrics.weakCards.map((item) => (
                <div key={item.id} className="rounded-3xl border border-coral/20 bg-coral/10 p-4">
                  <p className="text-lg font-semibold text-white">{item.portuguese}</p>
                  <p className="mt-1 text-sm text-orange-100">{item.english}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-orange-200/80">{item.subject} / {item.levelBand}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-orange-200/80">
                    Missed {item.stats.incorrect} time{item.stats.incorrect === 1 ? '' : 's'}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/30 p-5 text-sm text-slate-300">
                Wrong answers will appear here after flashcard or translation mistakes.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
