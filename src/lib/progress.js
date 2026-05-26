export const LEGACY_PROGRESS_STORAGE_KEY = 'portuguese-companion-progress';

function createEmptyCardStats() {
  return {
    correct: 0,
    incorrect: 0,
    reviewCount: 0,
    assistedCount: 0,
    correctStreak: 0,
    incorrectStreak: 0,
    lastResult: null,
    firstReviewedAt: null,
    lastReviewedAt: null,
    lastCorrectAt: null,
    lastIncorrectAt: null,
    lastAssistedAt: null,
    nextReviewAt: null,
    proficiency: 0,
  };
}

function normalizeCardStats(stats = {}) {
  return {
    ...createEmptyCardStats(),
    ...stats,
  };
}

export function createEmptyProgress() {
  return {
    streak: 0,
    lastActiveDate: null,
    totals: {
      correct: 0,
      incorrect: 0,
    },
    dailyActivity: {},
    itemStats: {},
    mistakes: [],
  };
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPreviousDateKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkPhraseAnswer(answer, expected) {
  return normalizeText(answer) === normalizeText(expected);
}

export function getCardStats(progress, cardId) {
  return normalizeCardStats(progress.itemStats[cardId]);
}

function getDaysSince(isoDate) {
  if (!isoDate) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(isoDate).getTime();

  if (Number.isNaN(timestamp)) {
    return Number.POSITIVE_INFINITY;
  }

  return (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
}

function addHours(isoDate, hours) {
  const timestamp = new Date(isoDate).getTime();
  return new Date(timestamp + hours * 60 * 60 * 1000).toISOString();
}

function addDays(isoDate, days) {
  const timestamp = new Date(isoDate).getTime();
  return new Date(timestamp + days * 24 * 60 * 60 * 1000).toISOString();
}

function calculateNextReviewAt(stats, isCorrect, reviewedAt) {
  if (!isCorrect) {
    return addHours(reviewedAt, 4);
  }

  const streak = stats.correctStreak + 1;
  const proficiency = Math.max(-5, Math.min(10, stats.proficiency + 1));

  if (streak <= 1) {
    return addDays(reviewedAt, 1);
  }

  if (streak === 2) {
    return addDays(reviewedAt, 3);
  }

  if (streak === 3) {
    return addDays(reviewedAt, 7);
  }

  if (streak === 4) {
    return addDays(reviewedAt, 14);
  }

  return addDays(reviewedAt, proficiency >= 6 ? 30 : 21);
}

export function isWeakCard(stats) {
  const normalized = normalizeCardStats(stats);
  const totalAnswers = normalized.correct + normalized.incorrect;

  if (totalAnswers === 0) {
    return false;
  }

  if (normalized.incorrectStreak > 0) {
    return true;
  }

  if (normalized.incorrect > normalized.correct) {
    return true;
  }

  const recentMiss = getDaysSince(normalized.lastIncorrectAt) <= 7;
  const accuracy = normalized.correct / totalAnswers;

  if (recentMiss && accuracy < 0.75) {
    return true;
  }

  return normalized.proficiency < 0 && getDaysSince(normalized.lastReviewedAt) <= 21;
}

export function isDueCard(stats) {
  const normalized = normalizeCardStats(stats);
  const totalAnswers = normalized.correct + normalized.incorrect;

  if (totalAnswers === 0) {
    return false;
  }

  if (!normalized.nextReviewAt) {
    return true;
  }

  const dueTimestamp = new Date(normalized.nextReviewAt).getTime();

  if (Number.isNaN(dueTimestamp)) {
    return true;
  }

  return dueTimestamp <= Date.now();
}

export function recordAnswer(progress, item, isCorrect, details = {}) {
  const today = getDateKey();
  const reviewedAt = new Date().toISOString();
  const alreadyActiveToday = progress.lastActiveDate === today;
  const previousDate = progress.lastActiveDate ? getPreviousDateKey(today) : null;
  const streak = alreadyActiveToday
    ? progress.streak
    : progress.lastActiveDate === previousDate
      ? progress.streak + 1
      : 1;
  const existingStats = getCardStats(progress, item.id);
  const wasAssisted = Boolean(details.assisted);
  const nextStats = {
    ...existingStats,
    correct: existingStats.correct + (isCorrect ? 1 : 0),
    incorrect: existingStats.incorrect + (isCorrect ? 0 : 1),
    reviewCount: existingStats.reviewCount + 1,
    assistedCount: existingStats.assistedCount + (wasAssisted ? 1 : 0),
    correctStreak: isCorrect ? existingStats.correctStreak + 1 : 0,
    incorrectStreak: isCorrect ? 0 : existingStats.incorrectStreak + 1,
    lastResult: isCorrect ? 'correct' : 'incorrect',
    firstReviewedAt: existingStats.firstReviewedAt || reviewedAt,
    lastReviewedAt: reviewedAt,
    lastCorrectAt: isCorrect ? reviewedAt : existingStats.lastCorrectAt,
    lastIncorrectAt: isCorrect ? existingStats.lastIncorrectAt : reviewedAt,
    lastAssistedAt: wasAssisted ? reviewedAt : existingStats.lastAssistedAt,
    nextReviewAt: calculateNextReviewAt(existingStats, isCorrect, reviewedAt),
    proficiency: Math.max(-5, Math.min(10, existingStats.proficiency + (isCorrect ? 1 : -2))),
    portuguese: item.portuguese,
    english: item.english,
    setId: item.setId,
    subject: item.subject,
    subjectId: item.subjectId,
    levelBand: item.levelBand,
    lastMode: details.mode || 'practice',
  };
  const todayStats = progress.dailyActivity[today] || { correct: 0, incorrect: 0 };
  const nextMistakes = isCorrect
    ? progress.mistakes
    : [
        {
          id: `${item.id}-${Date.now()}`,
          itemId: item.id,
          setId: item.setId,
          subject: item.subject,
          levelBand: item.levelBand,
          prompt: details.prompt || item.english,
          expected: details.expected || item.portuguese,
          answer: details.answer || '',
          expectedLanguage: details.expectedLanguage || 'portuguese',
          createdAt: new Date().toISOString(),
          mode: details.mode || 'practice',
        },
        ...progress.mistakes,
      ].slice(0, 150);

  return {
    ...progress,
    streak,
    lastActiveDate: today,
    totals: {
      correct: progress.totals.correct + (isCorrect ? 1 : 0),
      incorrect: progress.totals.incorrect + (isCorrect ? 0 : 1),
    },
    dailyActivity: {
      ...progress.dailyActivity,
      [today]: {
        correct: todayStats.correct + (isCorrect ? 1 : 0),
        incorrect: todayStats.incorrect + (isCorrect ? 0 : 1),
      },
    },
    itemStats: {
      ...progress.itemStats,
      [item.id]: nextStats,
    },
    mistakes: nextMistakes,
  };
}

export function getSetMetrics(progress, flashcardSet) {
  const cards = flashcardSet.cards.map((card) => ({
    ...card,
    stats: getCardStats(progress, card.id),
  }));
  const learnedCount = cards.filter((card) => card.stats.correct > 0).length;
  const seenCount = cards.filter((card) => card.stats.correct + card.stats.incorrect > 0).length;
  const weakCards = cards.filter((card) => isWeakCard(card.stats));
  const dueCards = cards.filter((card) => isDueCard(card.stats));
  const totalCorrect = cards.reduce((sum, card) => sum + card.stats.correct, 0);
  const totalIncorrect = cards.reduce((sum, card) => sum + card.stats.incorrect, 0);
  const totalAnswers = totalCorrect + totalIncorrect;

  return {
    setId: flashcardSet.id,
    subjectId: flashcardSet.subjectId,
    subject: flashcardSet.subject,
    levelBand: flashcardSet.levelBand,
    cardCount: flashcardSet.cardCount,
    learnedCount,
    seenCount,
    newCount: flashcardSet.cardCount - seenCount,
    weakCount: weakCards.length,
    weakCards,
    dueCount: dueCards.length,
    dueCards,
    accuracy: totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
  };
}

export function getSetSummary(progress, setDefinition) {
  const statsEntries = Object.values(progress.itemStats)
    .map((item) => normalizeCardStats(item))
    .filter((item) => item.setId === setDefinition.id);
  const learnedCount = statsEntries.filter((item) => item.correct > 0).length;
  const seenCount = statsEntries.filter((item) => item.correct + item.incorrect > 0).length;
  const weakCount = statsEntries.filter((item) => isWeakCard(item)).length;
  const dueCount = statsEntries.filter((item) => isDueCard(item)).length;
  const totalCorrect = statsEntries.reduce((sum, item) => sum + item.correct, 0);
  const totalIncorrect = statsEntries.reduce((sum, item) => sum + item.incorrect, 0);
  const totalAnswers = totalCorrect + totalIncorrect;

  return {
    setId: setDefinition.id,
    subjectId: setDefinition.subjectId,
    subject: setDefinition.subject,
    levelBand: setDefinition.levelBand,
    cardCount: setDefinition.cardCount,
    learnedCount,
    seenCount,
    newCount: setDefinition.cardCount - seenCount,
    weakCount,
    dueCount,
    accuracy: totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
  };
}

export function getDashboardMetrics(progress, flashcardSetDefinitions, subjectCatalog) {
  const today = getDateKey();
  const todayStats = progress.dailyActivity[today] || { correct: 0, incorrect: 0 };
  const answersToday = todayStats.correct + todayStats.incorrect;
  const normalizedItemStats = Object.entries(progress.itemStats).map(([id, stats]) => ({
    id,
    stats: normalizeCardStats(stats),
  }));
  const cardsLearned = normalizedItemStats.filter(({ stats }) => stats.correct > 0).length;
  const dueToday = normalizedItemStats.filter(({ stats }) => isDueCard(stats)).length;
  const setMetrics = flashcardSetDefinitions.map((set) => getSetSummary(progress, set));
  const weakCards = normalizedItemStats
    .map(({ id, stats }) => ({
      id,
      portuguese: stats.portuguese || 'Saved card',
      english: stats.english || '',
      subject: stats.subject,
      levelBand: stats.levelBand,
      stats,
    }))
    .filter((card) => isWeakCard(card.stats))
    .sort((left, right) => {
      const leftSeverity = (left.stats.incorrect - left.stats.correct) + left.stats.incorrectStreak;
      const rightSeverity = (right.stats.incorrect - right.stats.correct) + right.stats.incorrectStreak;
      const leftRecentMiss = new Date(left.stats.lastIncorrectAt || 0).getTime();
      const rightRecentMiss = new Date(right.stats.lastIncorrectAt || 0).getTime();
      return rightSeverity - leftSeverity || rightRecentMiss - leftRecentMiss;
    })
    .slice(0, 5);
  const accuracyBase = progress.totals.correct + progress.totals.incorrect;
  const accuracy = accuracyBase ? Math.round((progress.totals.correct / accuracyBase) * 100) : 0;
  const subjects = subjectCatalog.map((subject) => {
    const loadedSets = setMetrics.filter((set) => set.subjectId === subject.id);
    const learned = loadedSets.reduce((sum, set) => sum + set.learnedCount, 0);
    const total = loadedSets.reduce((sum, set) => sum + set.cardCount, 0);

    return {
      ...subject,
      loadedSetCount: loadedSets.length,
      learned,
      total,
    };
  });

  return {
    todayStats,
    answersToday,
    cardsLearned,
    dueToday,
    weakCards,
    accuracy,
    setMetrics,
    subjects,
  };
}
