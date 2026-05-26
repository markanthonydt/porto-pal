import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { buildDeck, buildMultipleChoiceOptions, buildPromptConfig, modes } from '../lib/flashcardSession';

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
  const [isLoadingSet, setIsLoadingSet] = useState(false);

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
        return;
      }

      setIsLoadingSet(true);
      await ensureSetLoaded(selectedSetDefinition.id);

      if (!ignore) {
        setIsLoadingSet(false);
      }
    }

    loadSelectedSet();

    return () => {
      ignore = true;
    };
  }, [ensureSetLoaded, selectedSetDefinition]);

  useEffect(() => {
    setDeck(buildDeck(selectedSet, mode, getCardStats));
    setShowAnswer(false);
    setIndex(0);
    setAnswer('');
    setFeedback(null);
  }, [selectedSet?.id, mode]);

  const card = deck.length ? deck[index] : null;
  const promptConfig = useMemo(() => buildPromptConfig(card, mode, index), [card, index, mode]);
  const multipleChoiceOptions = useMemo(() => {
    if (!mode.startsWith('multiple-choice')) {
      return [];
    }

    return buildMultipleChoiceOptions(card, selectedSet, promptConfig);
  }, [card, mode, promptConfig, selectedSet]);

  const modeLabel = modes.find((entry) => entry.id === mode)?.label;

  function clearCardUi() {
    setShowAnswer(false);
    setAnswer('');
    setFeedback(null);
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
    mode,
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
  };
}
