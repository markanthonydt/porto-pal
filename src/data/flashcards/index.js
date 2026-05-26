import greetingsA1A2 from './01_greetings_social_a1_a2.json';
import greetingsB1B2 from './01_greetings_social_b1_b2.json';
import foodA1A2 from './02_food_cafes_restaurants_a1_a2.json';
import foodB1B2 from './02_food_cafes_restaurants_b1_b2.json';
import travelA1A2 from './03_travel_directions_a1_a2.json';
import travelB1B2 from './03_travel_directions_b1_b2.json';
import workA1A2 from './04_work_daily_routine_a1_a2.json';
import workB1B2 from './04_work_daily_routine_b1_b2.json';
import homeA1A2 from './05_home_family_relationships_a1_a2.json';
import homeB1B2 from './05_home_family_relationships_b1_b2.json';
import healthA1A2 from './06_health_appointments_a1_a2.json';
import healthB1B2 from './06_health_appointments_b1_b2.json';
import shoppingA1A2 from './07_shopping_money_a1_a2.json';
import shoppingB1B2 from './07_shopping_money_b1_b2.json';
import emotionsA1A2 from './08_emotions_opinions_personality_a1_a2.json';
import emotionsB1B2 from './08_emotions_opinions_personality_b1_b2.json';
import grammarA1A2 from './09_grammar_verbs_patterns_a1_a2.json';
import grammarB1B2 from './09_grammar_verbs_patterns_b1_b2.json';
import cultureA1A2 from './10_culture_media_conversation_a1_a2.json';
import cultureB1B2 from './10_culture_media_conversation_b1_b2.json';
import conversationA1A2 from './11_everyday_conversation_tools_a1_a2.json';
import conversationB1B2 from './11_everyday_conversation_tools_b1_b2.json';
import timeA1A2 from './12_time_dates_scheduling_a1_a2.json';
import timeB1B2 from './12_time_dates_scheduling_b1_b2.json';

export const subjectCatalog = [
  { id: 'greetings-social', order: 1, subject: 'Greetings & Social Basics' },
  { id: 'food-cafes-restaurants', order: 2, subject: 'Food, Cafes & Restaurants' },
  { id: 'travel-directions', order: 3, subject: 'Travel & Directions' },
  { id: 'work-daily-routine', order: 4, subject: 'Work & Daily Routine' },
  { id: 'home-family-relationships', order: 5, subject: 'Home, Family & Relationships' },
  { id: 'health-appointments', order: 6, subject: 'Health & Appointments' },
  { id: 'shopping-money', order: 7, subject: 'Shopping & Money' },
  { id: 'emotions-opinions-personality', order: 8, subject: 'Emotions, Opinions & Personality' },
  { id: 'grammar-verbs-patterns', order: 9, subject: 'Grammar Patterns & Verb Forms' },
  { id: 'culture-media-conversation', order: 10, subject: 'Culture, Media & Conversation' },
  { id: 'everyday-conversation-tools', order: 11, subject: 'Everyday Conversation Tools' },
  { id: 'time-dates-scheduling', order: 12, subject: 'Time, Dates & Scheduling' },
];

const flashcardSetSources = [
  {
    id: '01_greetings_social_a1_a2',
    subjectId: 'greetings-social',
    subject: 'Greetings & Social Basics',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: greetingsA1A2,
  },
  {
    id: '01_greetings_social_b1_b2',
    subjectId: 'greetings-social',
    subject: 'Greetings & Social Basics',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: greetingsB1B2,
  },
  {
    id: '02_food_cafes_restaurants_a1_a2',
    subjectId: 'food-cafes-restaurants',
    subject: 'Food, Cafes & Restaurants',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: foodA1A2,
  },
  {
    id: '02_food_cafes_restaurants_b1_b2',
    subjectId: 'food-cafes-restaurants',
    subject: 'Food, Cafes & Restaurants',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: foodB1B2,
  },
  {
    id: '03_travel_directions_a1_a2',
    subjectId: 'travel-directions',
    subject: 'Travel & Directions',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: travelA1A2,
  },
  {
    id: '03_travel_directions_b1_b2',
    subjectId: 'travel-directions',
    subject: 'Travel & Directions',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: travelB1B2,
  },
  {
    id: '04_work_daily_routine_a1_a2',
    subjectId: 'work-daily-routine',
    subject: 'Work & Daily Routine',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: workA1A2,
  },
  {
    id: '04_work_daily_routine_b1_b2',
    subjectId: 'work-daily-routine',
    subject: 'Work & Daily Routine',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: workB1B2,
  },
  {
    id: '05_home_family_relationships_a1_a2',
    subjectId: 'home-family-relationships',
    subject: 'Home, Family & Relationships',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: homeA1A2,
  },
  {
    id: '05_home_family_relationships_b1_b2',
    subjectId: 'home-family-relationships',
    subject: 'Home, Family & Relationships',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: homeB1B2,
  },
  {
    id: '06_health_appointments_a1_a2',
    subjectId: 'health-appointments',
    subject: 'Health & Appointments',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: healthA1A2,
  },
  {
    id: '06_health_appointments_b1_b2',
    subjectId: 'health-appointments',
    subject: 'Health & Appointments',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: healthB1B2,
  },
  {
    id: '07_shopping_money_a1_a2',
    subjectId: 'shopping-money',
    subject: 'Shopping & Money',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: shoppingA1A2,
  },
  {
    id: '07_shopping_money_b1_b2',
    subjectId: 'shopping-money',
    subject: 'Shopping & Money',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: shoppingB1B2,
  },
  {
    id: '08_emotions_opinions_personality_a1_a2',
    subjectId: 'emotions-opinions-personality',
    subject: 'Emotions, Opinions & Personality',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: emotionsA1A2,
  },
  {
    id: '08_emotions_opinions_personality_b1_b2',
    subjectId: 'emotions-opinions-personality',
    subject: 'Emotions, Opinions & Personality',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: emotionsB1B2,
  },
  {
    id: '09_grammar_verbs_patterns_a1_a2',
    subjectId: 'grammar-verbs-patterns',
    subject: 'Grammar Patterns & Verb Forms',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: grammarA1A2,
  },
  {
    id: '09_grammar_verbs_patterns_b1_b2',
    subjectId: 'grammar-verbs-patterns',
    subject: 'Grammar Patterns & Verb Forms',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: grammarB1B2,
  },
  {
    id: '10_culture_media_conversation_a1_a2',
    subjectId: 'culture-media-conversation',
    subject: 'Culture, Media & Conversation',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: cultureA1A2,
  },
  {
    id: '10_culture_media_conversation_b1_b2',
    subjectId: 'culture-media-conversation',
    subject: 'Culture, Media & Conversation',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: cultureB1B2,
  },
  {
    id: '11_everyday_conversation_tools_a1_a2',
    subjectId: 'everyday-conversation-tools',
    subject: 'Everyday Conversation Tools',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: conversationA1A2,
  },
  {
    id: '11_everyday_conversation_tools_b1_b2',
    subjectId: 'everyday-conversation-tools',
    subject: 'Everyday Conversation Tools',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: conversationB1B2,
  },
  {
    id: '12_time_dates_scheduling_a1_a2',
    subjectId: 'time-dates-scheduling',
    subject: 'Time, Dates & Scheduling',
    levelBand: 'A1-A2',
    cardCount: 50,
    cards: timeA1A2,
  },
  {
    id: '12_time_dates_scheduling_b1_b2',
    subjectId: 'time-dates-scheduling',
    subject: 'Time, Dates & Scheduling',
    levelBand: 'B1-B2',
    cardCount: 50,
    cards: timeB1B2,
  },
];

function enrichCards(cards, setDefinition) {
  return cards.map((card) => ({
    ...card,
    setId: setDefinition.id,
    subject: setDefinition.subject,
    subjectId: setDefinition.subjectId,
    levelBand: setDefinition.levelBand,
  }));
}

export const flashcardSets = flashcardSetSources.map(({ cards, ...setDefinition }) => ({
  ...setDefinition,
  cards: enrichCards(cards, setDefinition),
}));

export async function loadFlashcardSet(setId) {
  return flashcardSets.find((entry) => entry.id === setId) || null;
}
