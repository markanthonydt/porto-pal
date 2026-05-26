import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { allFlashcards, flashcardSets, subjectCatalog } from '../data/flashcards';
import {
  checkPhraseAnswer,
  createEmptyProgress,
  getCardStats,
  getDashboardMetrics,
  getSetMetrics,
  loadProgress,
  recordAnswer,
  saveProgress,
} from '../lib/progress';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const value = useMemo(() => {
    const metrics = getDashboardMetrics(progress, flashcardSets, subjectCatalog);

    return {
      progress,
      metrics,
      subjectCatalog,
      flashcardSets,
      allFlashcards,
      getCardStats(cardId) {
        return getCardStats(progress, cardId);
      },
      getSetMetrics(setId) {
        const set = flashcardSets.find((entry) => entry.id === setId);
        return set ? getSetMetrics(progress, set) : null;
      },
      markFlashcard(item, knewIt, details = {}) {
        setProgress((current) =>
          recordAnswer(current, item, knewIt, {
            mode: details.mode || 'learn-new',
            prompt: details.prompt || item.portuguese,
            expected: details.expected || item.english,
            answer: details.answer || '',
            expectedLanguage: details.expectedLanguage || 'english',
          }),
        );
      },
      submitPractice(item, answer, expected, details = {}) {
        const isCorrect = checkPhraseAnswer(answer, expected);
        setProgress((current) =>
          recordAnswer(current, item, isCorrect, {
            mode: details.mode || 'typed-answer',
            prompt: details.prompt || item.english,
            expected,
            answer,
            expectedLanguage: details.expectedLanguage || 'portuguese',
          }),
        );
        return isCorrect;
      },
      clearMistakes() {
        setProgress((current) => ({ ...current, mistakes: [] }));
      },
      resetProgress() {
        setProgress(createEmptyProgress());
      },
    };
  }, [progress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }

  return context;
}
