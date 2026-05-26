import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import {
  buildDeck,
  buildMultipleChoiceOptions,
  buildPromptConfig,
  buildReviewSetExerciseMap,
  modes,
} from '../lib/flashcardSession';

const CHUNK_RELOAD_KEY = 'porto-pal-chunk-reload-attempted';

function shouldReloadForChunkError(error) {
  const message = String(error?.message || error || '');
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('Unable to preload CSS')
  );
}

export function useFlashcardSession() {
  const { ensureSetLoaded, flashcardSets, getCardStats, getLoadedSet, getSetSummary, markFlashcard, submitPractice, subjectCatalog } = useProgress();
  const [subjectId, setSubjectId] = useState(subjectCatalog[0]?.id || '');
  const [levelBand, setLevelBand] = useState('A1-A2');
  const [mode, setMode] = useState('learn-new');
  const [showAnswer, setShowAnswer] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [deck, setDeck] = useState([]);
  const [reviewSetExerciseMap, setReviewSetExerciseMap] = useState({});
  const [revealedLetterCount, setRevealedLetterCount] = useState(0);
  const [isLoadingSet, setIsLoadingSet] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const selectedSubject = subjectCatalog.find((subject) => subject.id === subjectId) || null;
  const selectedSetDefinition = useMemo(
    () => flashcardSets.find((set) => set.subjectId === subjectId && set.levelBand === levelBand) || null,
    [flashcardSets, levelBand, subjectId],
  );
  const selectedSet = selectedSetDefinition ? getLoadedSet(selectedSetDefinition.id) : null;
  const selectedSetMetrics = selectedSetDefinition ? getSetSummary(selectedSetDefinition.id) : null;

  useEffect(() => {
    const subjectSets = flashcardSets.filter((set) => set.subjectId === subjectId);

    if (!subjectSets.some((set) => set.levelBand === levelBand)) {
      setLevelBand(subjectSets[0]?.levelBand || 'A1-A2');
    }
  }, [flashcardSets, levelBand, subjectId]);

  useEffect(() => {
    let ignore = false;

    async function loadSelectedSet() {
      if (!selectedSetDefinition) {
        setLoadError(null);
        return;
      }

      setIsLoadingSet(true);
      setLoadError(null);

      try {
        await ensureSetLoaded(selectedSetDefinition.id);
      } catch (error) {
        if (shouldReloadForChunkError(error)) {
          const hasRetried = window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';

          if (!hasRetried) {
            window.sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
            window.location.reload();
            return;
          }
        }

        if (!ignore) {
          setLoadError('This topic could not be loaded. Refresh the page and try again.');
        }
      } finally {
        if (!ignore) {
          setIsLoadingSet(false);
        }
      }
    }

    loadSelectedSet();

    return () => {
      ignore = true;
    };
  }, [ensureSetLoaded, selectedSetDefinition]);

  useEffect(() => {
    const nextDeck = buildDeck(selectedSet, mode, getCardStats);
    setDeck(nextDeck);
    setReviewSetExerciseMap(mode === 'review-set' ? buildReviewSetExerciseMap(nextDeck) : {});
    setShowAnswer(false);
    setIndex(0);
    setAnswer('');
    setFeedback(null);
    setRevealedLetterCount(0);
  }, [selectedSet?.id, mode]);

  const card = deck.length ? deck[index] : null;
  const activeMode = mode === 'review-set' && card ? reviewSetExerciseMap[card.id] || 'translate-en-pt' : mode;
  const promptConfig = useMemo(() => buildPromptConfig(card, activeMode, index), [activeMode, card, index]);
  const multipleChoiceOptions = useMemo(() => {
    if (!activeMode.startsWith('multiple-choice')) {
      return [];
    }

    return buildMultipleChoiceOptions(card, selectedSet, promptConfig);
  }, [activeMode, card, promptConfig, selectedSet]);

  const modeLabel = modes.find((entry) => entry.id === mode)?.label;

  function clearCardUi() {
    setShowAnswer(false);
    setAnswer('');
    setFeedback(null);
    setRevealedLetterCount(0);
  }

  function moveNext() {
    clearCardUi();
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
    clearCardUi();
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
      mode: activeMode,
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
      mode: activeMode,
      prompt: promptConfig.promptText,
      assisted: revealedLetterCount > 0,
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

  function revealNextLetter() {
    if (!promptConfig || feedback) {
      return;
    }

    setAnswer((current) => {
      const expected = promptConfig.expected || '';
      const nextLength = Math.min(current.length + 1, expected.length);
      return expected.slice(0, nextLength);
    });
    setRevealedLetterCount((current) => current + 1);
  }

  function markCurrentCard(knewIt) {
    if (!card) {
      return;
    }

    markFlashcard(card, knewIt, {
      mode,
      prompt: card.portuguese,
      expected: card.english,
      expectedLanguage: 'english',
    });
    finishCurrentCard();
  }

  function markWordBankCard(entry, knewIt) {
    markFlashcard(entry, knewIt, {
      mode: 'word-bank',
      prompt: entry.portuguese,
      expected: entry.english,
      expectedLanguage: 'english',
    });
  }

  return {
    answer,
    card,
    deck,
    feedback,
    flashcardSets,
    getCardStats,
    index,
    isLoadingSet,
    levelBand,
    loadError,
    mode,
    activeMode,
    modeLabel,
    multipleChoiceOptions,
    promptConfig,
    selectedSet,
    selectedSetDefinition,
    selectedSetMetrics,
    selectedSubject,
    showAnswer,
    subjectCatalog,
    subjectId,
    setAnswer,
    setLevelBand,
    setMode,
    setShowAnswer,
    setSubjectId,
    handleChoice,
    handleTypedSubmit,
    insertCharacter,
    markCurrentCard,
    markWordBankCard,
    moveNext,
    revealNextLetter,
    revealedLetterCount,
  };
}
