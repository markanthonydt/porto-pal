import { portugueseCharacters } from '../../lib/flashcardSession';
import WordBankPanel from './WordBankPanel';

function EmptyStatePanel({ mode, setMode }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 p-8 text-center">
      <p className="text-lg text-white">
        {mode === 'learn-new'
          ? "You've gone through every new card in this set."
          : mode === 'review-weak'
            ? 'No phrases left to review right now.'
            : mode === 'due-review'
              ? 'No cards are due for review right now.'
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
  );
}

function ReviewCardPanel({ card, markCurrentCard, setShowAnswer, showAnswer }) {
  return (
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
          onClick={() => markCurrentCard(false)}
          className="flex-1 rounded-2xl bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
        >
          Need review
        </button>
        <button
          type="button"
          onClick={() => markCurrentCard(true)}
          className="flex-1 rounded-2xl bg-sea px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
        >
          I knew it
        </button>
      </div>
    </>
  );
}

function MultipleChoicePanel({ card, feedback, handleChoice, multipleChoiceOptions, promptConfig }) {
  return (
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
  );
}

function TypedAnswerPanel({
  answer,
  card,
  feedback,
  handleTypedSubmit,
  insertCharacter,
  moveNext,
  promptConfig,
  setAnswer,
}) {
  return (
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
  );
}

function FeedbackPanel({ feedback, mode, moveNext }) {
  if (!feedback) {
    return null;
  }

  return (
    <div className={`mt-6 rounded-[1.75rem] border p-5 ${feedback.isCorrect ? 'border-sea/40 bg-sea/15' : 'border-coral/40 bg-coral/15'}`}>
      <p className={`text-sm uppercase tracking-[0.25em] ${feedback.isCorrect ? 'text-teal-200' : 'text-orange-200'}`}>
        {feedback.isCorrect ? 'Correct' : 'Try again'}
      </p>
      <p className="mt-3 text-lg text-white">
        {feedback.isCorrect ? 'Good. This card now counts toward your learned progress.' : `Incorrect. The correct answer is: ${feedback.expected}`}
      </p>
      {mode.startsWith('multiple-choice') && feedback.selected ? <p className="mt-2 text-sm text-slate-200">You chose: {feedback.selected}</p> : null}
      <button
        type="button"
        onClick={moveNext}
        className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
      >
        Next card
      </button>
    </div>
  );
}

export default function FlashcardStudyPanel({
  answer,
  card,
  deck,
  feedback,
  getCardStats,
  handleChoice,
  handleTypedSubmit,
  index,
  insertCharacter,
  isLoadingSet,
  loadError,
  markCurrentCard,
  markWordBankCard,
  mode,
  modeLabel,
  moveNext,
  multipleChoiceOptions,
  promptConfig,
  selectedSet,
  selectedSetDefinition,
  setAnswer,
  setMode,
  setShowAnswer,
  showAnswer,
}) {
  return (
    <section className="order-1 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/15 to-white/5 p-6 shadow-soft lg:order-2">
      {!selectedSetDefinition ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 p-5 text-center text-sm text-slate-300 sm:p-6">
          Select a level, subject, and mode to begin.
        </div>
      ) : loadError ? (
        <div className="rounded-[1.75rem] border border-coral/30 bg-coral/10 p-5 text-center text-sm text-orange-100 sm:p-6">
          {loadError}
        </div>
      ) : isLoadingSet && !selectedSet ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/30 p-5 text-center text-sm text-slate-300 sm:p-6">
          Loading topic...
        </div>
      ) : mode === 'word-bank' ? (
        <WordBankPanel
          deck={deck}
          getCardStats={getCardStats}
          markWordBankCard={markWordBankCard}
          selectedSet={selectedSet}
        />
      ) : !card ? (
        <EmptyStatePanel mode={mode} setMode={setMode} />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{selectedSet.subject}</p>
              <p className="mt-1 text-sm text-slate-300">{selectedSet.levelBand} / {modeLabel}</p>
            </div>
            <p className="rounded-full bg-slate-950/40 px-4 py-2 text-sm text-slate-200">
              Card {index + 1} of {deck.length}
            </p>
          </div>

          {(mode === 'learn-new' || mode === 'review-weak') && promptConfig ? (
            <ReviewCardPanel
              card={card}
              markCurrentCard={markCurrentCard}
              setShowAnswer={setShowAnswer}
              showAnswer={showAnswer}
            />
          ) : mode.startsWith('multiple-choice') && promptConfig ? (
            <MultipleChoicePanel
              card={card}
              feedback={feedback}
              handleChoice={handleChoice}
              multipleChoiceOptions={multipleChoiceOptions}
              promptConfig={promptConfig}
            />
          ) : promptConfig ? (
            <TypedAnswerPanel
              answer={answer}
              card={card}
              feedback={feedback}
              handleTypedSubmit={handleTypedSubmit}
              insertCharacter={insertCharacter}
              moveNext={moveNext}
              promptConfig={promptConfig}
              setAnswer={setAnswer}
            />
          ) : null}

          <FeedbackPanel feedback={feedback} mode={mode} moveNext={moveNext} />
        </>
      )}
    </section>
  );
}
