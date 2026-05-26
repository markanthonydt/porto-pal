const STORAGE_KEY = 'portuguese-companion-progress';

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

export function loadProgress() {
  if (typeof window === 'undefined') {
    return createEmptyProgress();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createEmptyProgress();
    }

    return {
      ...createEmptyProgress(),
      ...JSON.parse(raw),
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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
  return progress.itemStats[cardId] || { correct: 0, incorrect: 0 };
}

export function isWeakCard(stats) {
  return stats.incorrect > stats.correct || (stats.incorrect > 0 && stats.correct === 0);
}

export function recordAnswer(progress, item, isCorrect, details = {}) {
  const today = getDateKey();
  const alreadyActiveToday = progress.lastActiveDate === today;
  const previousDate = progress.lastActiveDate ? getPreviousDateKey(today) : null;
  const streak = alreadyActiveToday
    ? progress.streak
    : progress.lastActiveDate === previousDate
      ? progress.streak + 1
      : 1;
  const existingStats = progress.itemStats[item.id] || { correct: 0, incorrect: 0 };
  const nextStats = {
    ...existingStats,
    correct: existingStats.correct + (isCorrect ? 1 : 0),
    incorrect: existingStats.incorrect + (isCorrect ? 0 : 1),
    setId: item.setId,
    subject: item.subject,
    subjectId: item.subjectId,
    levelBand: item.levelBand,
    lastMode: details.mode || 'practice',
    lastReviewedAt: new Date().toISOString(),
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
    accuracy: totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
  };
}

export function getDashboardMetrics(progress, flashcardSets, subjectCatalog) {
  const today = getDateKey();
  const todayStats = progress.dailyActivity[today] || { correct: 0, incorrect: 0 };
  const answersToday = todayStats.correct + todayStats.incorrect;
  const cardsLearned = Object.values(progress.itemStats).filter((item) => item.correct > 0).length;
  const setMetrics = flashcardSets.map((set) => getSetMetrics(progress, set));
  const weakCards = flashcardSets
    .flatMap((set) => set.cards)
    .map((card) => ({
      ...card,
      stats: getCardStats(progress, card.id),
    }))
    .filter((card) => isWeakCard(card.stats))
    .sort((left, right) => {
      const leftGap = left.stats.incorrect - left.stats.correct;
      const rightGap = right.stats.incorrect - right.stats.correct;
      return rightGap - leftGap || right.stats.incorrect - left.stats.incorrect;
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
    weakCards,
    accuracy,
    setMetrics,
    subjects,
  };
}
