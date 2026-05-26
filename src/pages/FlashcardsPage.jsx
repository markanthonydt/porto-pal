import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';

const portugueseCharacters = ['á', 'à', 'â', 'ã', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'];

const modes = [
  { id: 'learn-new', label: 'Learn new cards', description: 'Reveal cards you have not learned yet.' },
  { id: 'review-weak', label: 'Review flash cards', description: 'Practice cards you still need to master.' },
  { id: 'review-set', label: 'Review this topic', description: "Practice this subject again, starting with the cards you're struggling with the most." },
  { id: 'word-bank', label: 'Word bank', description: 'See all cards on each topic and select any that you want to review.' },
  { id: 'multiple-choice-en-pt', label: 'Multiple choice: English to Portuguese', description: 'Choose the Portuguese phrase from options.' },
  { id: 'multiple-choice-pt-en', label: 'Multiple choice: Portuguese to English', description: 'Choose the English meaning from options.' },
  { id: 'translate-en-pt', label: 'Translate English to Portuguese', description: 'Type the Portuguese phrase.' },
  { id: 'translate-pt-en', label: 'Translate Portuguese to English', description: 'Type the English meaning.' },
  { id: 'type-answer', label: 'Translate between both languages', description: 'Type the correct answer.' },
];

const levelBands = ['A1-A2', 'B1-B2'];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function isQuestion(text) {
  return String(text || '').trim().endsWith('?');
}

function getReviewPriority(stats) {
  const gap = stats.incorrect - stats.correct;
  const lastReviewedAt = stats.lastReviewedAt ? new Date(stats.lastReviewedAt).getTime() : 0;

  return { gap, lastReviewedAt };
}

function buildDeck(selectedSet, mode, getCardStats) {
  if (!selectedSet) {
    return [];
  }

  if (mode === 'word-bank') {
    return selectedSet.cards;
  }

  if (mode === 'learn-new') {
    return shuffle(
      selectedSet.cards.filter((card) => {
        const stats = getCardStats(card.id);
        return stats.correct === 0 && stats.incorrect === 0;
      }),
    );
  }

  if (mode === 'review-weak') {
    return shuffle(
      selectedSet.cards.filter((card) => {
        const stats = getCardStats(card.id);
        return stats.incorrect > stats.correct || (stats.incorrect > 0 && stats.correct === 0);
      }),
    );
  }

  if (mode === 'review-set') {
    return [...selectedSet.cards].sort((left, right) => {
      const leftStats = getCardStats(left.id);
      const rightStats = getCardStats(right.id);
      const leftPriority = getReviewPriority(leftStats);
      const rightPriority = getReviewPriority(rightStats);

      return (
        rightPriority.gap - leftPriority.gap ||
        leftPriority.lastReviewedAt - rightPriority.lastReviewedAt ||
        left.english.localeCompare(right.english)
      );
    });
  }

  return shuffle(selectedSet.cards);
}

export default function FlashcardsPage() {
  const { flashcardSets, getCardStats, getSetMetrics, markFlashcard, submitPractice, subjectCatalog } = useProgress();
  const [subjectId, setSubjectId] = useState(subjectCatalog[0]?.id || '');
  const [levelBand, setLevelBand] = useState('A1-A2');
  const [mode, setMode] = useState('learn-new');
  const [showAnswer, setShowAnswer] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [deck, setDeck] = useState([]);

  const selectedSubject = subjectCatalog.find((subject) => subject.id === subjectId) || null;
  const selectedSet = useMemo(
    () => flashcardSets.find((set) => set.subjectId === subjectId && set.levelBand === levelBand) || null,
    [flashcardSets, levelBand, subjectId],
  );
  const selectedSetMetrics = selectedSet ? getSetMetrics(selectedSet.id) : null;

  useEffect(() => {
    const subjectSets = flashcardSets.filter((set) => set.subjectId === subjectId);

    if (!subjectSets.some((set) => set.levelBand === levelBand)) {
      setLevelBand(subjectSets[0]?.levelBand || 'A1-A2');
    }
  }, [flashcardSets, levelBand, subjectId]);

  useEffect(() => {
    setDeck(buildDeck(selectedSet, mode, getCardStats));
    setShowAnswer(false);
    setIndex(0);
    setAnswer('');
    setFeedback(null);
  }, [selectedSet?.id, mode]);

  const card = deck.length ? deck[index] : null;
  const promptConfig = useMemo(() => {
    if (!card) {
      return null;
    }

    if (mode === 'translate-en-pt') {
      return {
        promptLabel: 'English',
        promptText: card.english,
        expected: card.portuguese,
        expectedLanguage: 'portuguese',
      };
    }

    if (mode === 'translate-pt-en') {
      return {
        promptLabel: 'Portuguese',
        promptText: card.portuguese,
        expected: card.english,
        expectedLanguage: 'english',
      };
    }

    if (mode === 'type-answer') {
      const ptToEn = index % 2 === 0;
      return {
        promptLabel: ptToEn ? 'Portuguese' : 'English',
        promptText: ptToEn ? card.portuguese : card.english,
        expected: ptToEn ? card.english : card.portuguese,
        expectedLanguage: ptToEn ? 'english' : 'portuguese',
      };
    }

    if (mode === 'multiple-choice-en-pt') {
      return {
        promptLabel: 'English',
        promptText: card.english,
        expected: card.portuguese,
        expectedLanguage: 'portuguese',
      };
    }

    if (mode === 'multiple-choice-pt-en') {
      return {
        promptLabel: 'Portuguese',
        promptText: card.portuguese,
        expected: card.english,
        expectedLanguage: 'english',
      };
    }

    return {
      promptLabel: 'Portuguese',
      promptText: card.portuguese,
      expected: card.english,
      expectedLanguage: 'english',
    };
  }, [card, index, mode]);

  const multipleChoiceOptions = useMemo(() => {
    if (!card || !selectedSet || !promptConfig || !mode.startsWith('multiple-choice')) {
      return [];
    }

    const field = promptConfig.expectedLanguage === 'english' ? 'english' : 'portuguese';
    const expectedIsQuestion = isQuestion(promptConfig.expected);
    const distractors = selectedSet.cards
      .filter((entry) => entry.id !== card.id)
      .filter((entry) => isQuestion(entry[field]) === expectedIsQuestion)
      .map((entry) => entry[field])
      .filter((value, position, items) => items.indexOf(value) === position);

    return shuffle([promptConfig.expected, ...shuffle(distractors).slice(0, 3)]);
  }, [card, mode, promptConfig, selectedSet]);

  function moveNext() {
    setShowAnswer(false);
    setAnswer('');
    setFeedback(null);
    setIndex((current) => {
      if (!deck.length) {
        return 0;
      }
      if (current >= deck.length - 1) {
        return 0;
      }
      return current + 1;
    });
  }

  function finishCurrentCard() {
    setShowAnswer(false);
    setAnswer('');
    setFeedback(null);
    setDeck((currentDeck) => {
      const nextDeck = currentDeck.filter((entry) => entry.id !== card?.id);
      setIndex((currentIndex) => {
        if (!nextDeck.length) {
          return 0;
        }

        return Math.min(currentIndex, nextDeck.length - 1);
      });
      return nextDeck;
    });
  }

  function handleChoice(selectedValue) {
    if (feedback || !promptConfig) {
      return;
    }

    const isCorrect = submitPractice(card, selectedValue, promptConfig.expected, {
      mode: 'multiple-choice',
      prompt: promptConfig.promptText,
      expectedLanguage: promptConfig.expectedLanguage,
    });

    setFeedback({
      isCorrect,
      expected: promptConfig.expected,
      selected: selectedValue,
    });
  }

  function handleTypedSubmit(event) {
    event.preventDefault();

    if (feedback || !promptConfig) {
      return;
    }

    const isCorrect = submitPractice(card, answer, promptConfig.expected, {
      mode,
      prompt: promptConfig.promptText,
      expectedLanguage: promptConfig.expectedLanguage,
    });

    setFeedback({
      isCorrect,
      expected: promptConfig.expected,
    });
  }

  function insertCharacter(character) {
    setAnswer((current) => `${current}${character}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
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
          {subjectCatalog.map((subject) => {
            const availableCount = flashcardSets.filter((set) => set.subjectId === subject.id).length;
            const isSelected = subject.id === subjectId;

            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => setSubjectId(subject.id)}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  isSelected ? 'border-sun/50 bg-white/15' : 'border-white/10 bg-slate-950/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-white">{subject.subject}</p>
                  </div>
                </div>
              </button>
            );
          })}
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

        {selectedSet && selectedSetMetrics ? (
          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{selectedSubject?.subject}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{selectedSet.levelBand}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-white/5 p-3">
                <p>{selectedSet.cardCount} cards</p>
                <p className="mt-1 text-slate-400">Topic size</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p>{selectedSetMetrics.learnedCount}/{selectedSet.cardCount} learned</p>
                <p className="mt-1 text-slate-400">Progress</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p>{selectedSetMetrics.weakCount} cards left to master</p>
                <p className="mt-1 text-slate-400">Needs review</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p>{selectedSetMetrics.newCount} new cards</p>
                <p className="mt-1 text-slate-400">Untouched</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMode('review-weak')}
              className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start review
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/25 p-5 text-sm text-slate-300">
            This subject has no JSON set files yet. Add the two level-band files and the index entry to activate it.
          </div>
        )}
      </section>

      <section className="order-1 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/15 to-white/5 p-6 shadow-soft lg:order-2">
        {!selectedSet ? (
          <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 p-5 text-center text-sm text-slate-300 sm:p-6">
            Select a level, subject, and mode to begin.
          </div>
        ) : mode === 'word-bank' ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{selectedSet.subject}</p>
                <p className="mt-1 text-sm text-slate-300">{selectedSet.levelBand} / Word bank</p>
              </div>
              <p className="rounded-full bg-slate-950/40 px-4 py-2 text-sm text-slate-200">
                {deck.length} cards
              </p>
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
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{entry.grammarFocus}</p>
                      </div>
                      <p className={`min-w-20 rounded-full px-3 py-1 text-center text-xs ${statusClasses}`}>
                        {statusLabel}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          markFlashcard(entry, false, {
                            mode: 'word-bank',
                            prompt: entry.portuguese,
                            expected: entry.english,
                            expectedLanguage: 'english',
                          })
                        }
                        className="flex-1 rounded-2xl bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
                      >
                        Mark for review
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          markFlashcard(entry, true, {
                            mode: 'word-bank',
                            prompt: entry.portuguese,
                            expected: entry.english,
                            expectedLanguage: 'english',
                          })
                        }
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
        ) : !card ? (
          <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 p-8 text-center">
            <p className="text-lg text-white">
              {mode === 'learn-new'
                ? "You've gone through every new card in this set."
                : mode === 'review-weak'
                  ? 'No phrases left to review right now.'
                  : 'No cards available for this mode.'}
            </p>
            {mode === 'learn-new' ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setMode('review-weak')}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Review cards left to master
                </button>
                <button
                  type="button"
                  onClick={() => setMode('review-set')}
                  className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Review this topic
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-300">Switch mode or choose another subject.</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{selectedSet.subject}</p>
                <p className="mt-1 text-sm text-slate-300">{selectedSet.levelBand} / {modes.find((entry) => entry.id === mode)?.label}</p>
              </div>
              <p className="rounded-full bg-slate-950/40 px-4 py-2 text-sm text-slate-200">
                Card {index + 1} of {deck.length}
              </p>
            </div>

            {(mode === 'learn-new' || mode === 'review-weak') && promptConfig ? (
              <>
                <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
                  <p className="text-sm text-slate-400">Portuguese</p>
                  <h3 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">{card.portuguese}</h3>
                  <p className="mt-4 text-sm text-slate-300">{card.grammarFocus}</p>
                  <p className="mt-2 text-sm text-slate-400">{card.notes}</p>
                  <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-5">
                    <p className="text-sm text-slate-400">English meaning</p>
                    <p className="mt-2 text-lg text-slate-100">{showAnswer ? card.english : 'Tap reveal to check yourself first.'}</p>
                  </div>
                  {showAnswer ? (
                    <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Example</p>
                      <p className="mt-2 text-base text-white">{card.exampleSentences[0]?.portuguese}</p>
                      <p className="mt-1 text-sm text-slate-400">{card.exampleSentences[0]?.english}</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowAnswer((current) => !current)}
                    className="flex-1 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    {showAnswer ? 'Hide answer' : 'Reveal answer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      markFlashcard(card, false, {
                        mode,
                        prompt: card.portuguese,
                        expected: card.english,
                        expectedLanguage: 'english',
                      });
                      finishCurrentCard();
                    }}
                    className="flex-1 rounded-2xl bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
                  >
                    Need review
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      markFlashcard(card, true, {
                        mode,
                        prompt: card.portuguese,
                        expected: card.english,
                        expectedLanguage: 'english',
                      });
                      finishCurrentCard();
                    }}
                    className="flex-1 rounded-2xl bg-sea px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
                  >
                    I knew it
                  </button>
                </div>
              </>
            ) : mode.startsWith('multiple-choice') && promptConfig ? (
              <div className="mt-6">
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
                  <p className="text-sm text-slate-400">{promptConfig.promptLabel}</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight text-white">{promptConfig.promptText}</h3>
                  <p className="mt-4 text-sm text-slate-300">{card.grammarFocus}</p>
                </div>
                <div className="mt-6 grid gap-3">
                  {multipleChoiceOptions.map((option) => {
                    const isCorrectOption = option === promptConfig.expected;
                    const isChosen = feedback?.selected === option;
                    let classes = 'rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-left text-white transition hover:bg-white/10';

                    if (feedback && isCorrectOption) {
                      classes = 'rounded-[1.5rem] border border-sea/40 bg-sea/15 px-5 py-4 text-left text-white';
                    } else if (feedback && isChosen && !isCorrectOption) {
                      classes = 'rounded-[1.5rem] border border-coral/40 bg-coral/15 px-5 py-4 text-left text-white';
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => handleChoice(option)}
                        className={classes}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : promptConfig ? (
              <div className="mt-6">
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
                  <p className="text-sm text-slate-400">{promptConfig.promptLabel}</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight text-white">{promptConfig.promptText}</h3>
                  <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Focus</p>
                    <p className="mt-2 text-sm text-slate-200">{card.grammarFocus}</p>
                    <p className="mt-2 text-sm text-slate-400">{card.notes}</p>
                  </div>
                </div>

                <form onSubmit={handleTypedSubmit}>
                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Type your answer here..."
                    className="mt-6 min-h-32 w-full rounded-[1.5rem] border border-white/10 bg-slate-950/50 px-4 py-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-sun/50"
                  />
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Portuguese characters</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {portugueseCharacters.map((character) => (
                        <button
                          key={character}
                          type="button"
                          onClick={() => insertCharacter(character)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          {character}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button type="submit" disabled={Boolean(feedback)} className="flex-1 rounded-2xl bg-sun px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60">
                      Check answer
                    </button>
                    <button type="button" onClick={moveNext} className="flex-1 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                      Skip card
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {feedback ? (
              <div className={`mt-6 rounded-[1.75rem] border p-5 ${feedback.isCorrect ? 'border-sea/40 bg-sea/15' : 'border-coral/40 bg-coral/15'}`}>
                <p className={`text-sm uppercase tracking-[0.25em] ${feedback.isCorrect ? 'text-teal-200' : 'text-orange-200'}`}>
                  {feedback.isCorrect ? 'Correct' : 'Try again'}
                </p>
                <p className="mt-3 text-lg text-white">
                  {feedback.isCorrect
                    ? 'Good. This card now counts toward your learned progress.'
                    : `Incorrect. The correct answer is: ${feedback.expected}`}
                </p>
                {mode.startsWith('multiple-choice') && feedback.selected ? (
                  <p className="mt-2 text-sm text-slate-200">You chose: {feedback.selected}</p>
                ) : null}
                <button
                  type="button"
                  onClick={moveNext}
                  className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Next card
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
