import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { flashcardSets, loadFlashcardSet, subjectCatalog } from '../data/flashcards';
import {
  checkPhraseAnswer,
  createEmptyProgress,
  getCardStats,
  getDashboardMetrics,
  getSetMetrics,
  getSetSummary,
  recordAnswer,
} from '../lib/progress';
import { loadStoredProgress, saveStoredProgress } from '../lib/progressStorage';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => createEmptyProgress());
  const [loadedSetMap, setLoadedSetMap] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function hydrateProgress() {
      const storedProgress = await loadStoredProgress();

      if (!ignore) {
        setProgress(storedProgress);
        setIsHydrated(true);
      }
    }

    hydrateProgress();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveStoredProgress(progress);
  }, [isHydrated, progress]);

  async function ensureSetLoaded(setId) {
    const loadedSet = loadedSetMap[setId] || flashcardSets.find((entry) => entry.id === setId) || await loadFlashcardSet(setId);

    if (!loadedSet) {
      return null;
    }

    setLoadedSetMap((current) => {
      if (current[setId]) {
        return current;
      }

      return {
        ...current,
        [setId]: loadedSet,
      };
    });

    return loadedSet;
  }

  const value = useMemo(() => {
    const metrics = getDashboardMetrics(progress, flashcardSets, subjectCatalog);

    return {
      progress,
      isHydrated,
      metrics,
      subjectCatalog,
      flashcardSets,
      loadedSetMap,
      ensureSetLoaded,
      getLoadedSet(setId) {
        return loadedSetMap[setId] || flashcardSets.find((entry) => entry.id === setId) || null;
      },
      getCardStats(cardId) {
        return getCardStats(progress, cardId);
      },
      getSetMetrics(setId) {
        const set = loadedSetMap[setId];
        return set ? getSetMetrics(progress, set) : null;
      },
      getSetSummary(setId) {
        const setDefinition = flashcardSets.find((entry) => entry.id === setId);
        return setDefinition ? getSetSummary(progress, setDefinition) : null;
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
            assisted: details.assisted || false,
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
  }, [loadedSetMap, progress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }

  return context;
}
