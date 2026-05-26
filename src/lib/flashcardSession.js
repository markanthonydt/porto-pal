import { isDueCard } from './progress';

export const portugueseCharacters = [
  '\u00e1',
  '\u00e0',
  '\u00e2',
  '\u00e3',
  '\u00e7',
  '\u00e9',
  '\u00ea',
  '\u00ed',
  '\u00f3',
  '\u00f4',
  '\u00f5',
  '\u00fa',
];

export const modes = [
  { id: 'learn-new', label: 'Learn new cards', description: 'Reveal cards you have not learned yet.' },
  { id: 'review-weak', label: 'Review flash cards', description: 'Practice cards you still need to master.' },
  { id: 'due-review', label: 'Due for review', description: 'Practice cards whose next review is due now.' },
  { id: 'review-set', label: 'Review this topic', description: "Practice this subject again, starting with the cards you're struggling with the most." },
  { id: 'word-bank', label: 'Word bank', description: 'See all cards on each topic and select any that you want to review.' },
  { id: 'multiple-choice-en-pt', label: 'Multiple choice: English to Portuguese', description: 'Choose the Portuguese phrase from options.' },
  { id: 'multiple-choice-pt-en', label: 'Multiple choice: Portuguese to English', description: 'Choose the English meaning from options.' },
  { id: 'translate-en-pt', label: 'Translate English to Portuguese', description: 'Type the Portuguese phrase.' },
  { id: 'translate-pt-en', label: 'Translate Portuguese to English', description: 'Type the English meaning.' },
  { id: 'type-answer', label: 'Translate between both languages', description: 'Type the correct answer.' },
];

export const levelBands = ['A1-A2', 'B1-B2'];

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

function getDuePriority(stats) {
  const nextReviewAt = stats.nextReviewAt ? new Date(stats.nextReviewAt).getTime() : 0;
  const lastReviewedAt = stats.lastReviewedAt ? new Date(stats.lastReviewedAt).getTime() : 0;
  const severity = (stats.incorrect - stats.correct) + stats.incorrectStreak;

  return { nextReviewAt, lastReviewedAt, severity };
}

export function buildDeck(selectedSet, mode, getCardStats) {
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

  if (mode === 'due-review') {
    return [...selectedSet.cards]
      .filter((card) => isDueCard(getCardStats(card.id)))
      .sort((left, right) => {
        const leftPriority = getDuePriority(getCardStats(left.id));
        const rightPriority = getDuePriority(getCardStats(right.id));

        return (
          leftPriority.nextReviewAt - rightPriority.nextReviewAt ||
          rightPriority.severity - leftPriority.severity ||
          leftPriority.lastReviewedAt - rightPriority.lastReviewedAt
        );
      });
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

export function buildPromptConfig(card, mode, index) {
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
}

export function buildMultipleChoiceOptions(card, selectedSet, promptConfig) {
  if (!card || !selectedSet || !promptConfig) {
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
}
