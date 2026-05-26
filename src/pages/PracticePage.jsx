import { useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';

function pickStartingItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export default function PracticePage() {
  const { phrases, submitPractice } = useProgress();
  const prompts = useMemo(() => phrases.filter((item) => item.portuguese.split(' ').length > 1), [phrases]);
  const [current, setCurrent] = useState(() => pickStartingItem(prompts));
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  function nextPrompt() {
    const next = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrent(next);
    setAnswer('');
    setFeedback(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const isCorrect = submitPractice(current, answer);
    setFeedback({
      isCorrect,
      expected: current.portuguese,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr,1.25fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Translation drill</p>
        <h2 className="mt-2 font-display text-3xl text-white">Phrase practice</h2>
        <p className="mt-3 text-sm text-slate-300">
          Translate the English prompt into Portuguese. Accents and punctuation are forgiven, but the words need to match.
        </p>
        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
          <p className="text-sm text-slate-400">Prompt</p>
          <p className="mt-3 text-2xl font-semibold text-white">{current.english}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-500">{current.category} · {current.level}</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/15 to-white/5 p-6 shadow-soft">
        <form onSubmit={handleSubmit}>
          <label htmlFor="translation" className="text-sm text-slate-300">
            Your Portuguese answer
          </label>
          <textarea
            id="translation"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type the Portuguese phrase here..."
            className="mt-3 min-h-36 w-full rounded-[1.5rem] border border-white/10 bg-slate-950/50 px-4 py-4 text-base text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sun/50"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="flex-1 rounded-2xl bg-sun px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300">
              Check answer
            </button>
            <button type="button" onClick={nextPrompt} className="flex-1 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
              Skip prompt
            </button>
          </div>
        </form>

        {feedback ? (
          <div className={`mt-6 rounded-[1.75rem] border p-5 ${feedback.isCorrect ? 'border-sea/40 bg-sea/15' : 'border-coral/40 bg-coral/15'}`}>
            <p className={`text-sm uppercase tracking-[0.25em] ${feedback.isCorrect ? 'text-teal-200' : 'text-orange-200'}`}>
              {feedback.isCorrect ? 'Correct' : 'Try again'}
            </p>
            <p className="mt-3 text-lg text-white">
              {feedback.isCorrect
                ? 'Good. This phrase is counted toward your learned set.'
                : `Expected: ${feedback.expected}`}
            </p>
            <button
              type="button"
              onClick={nextPrompt}
              className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Next phrase
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
