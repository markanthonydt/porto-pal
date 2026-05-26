import greetingsSocialA1A2 from './01_greetings_social_a1_a2.json';
import greetingsSocialB1B2 from './01_greetings_social_b1_b2.json';
import foodCafesRestaurantsA1A2 from './02_food_cafes_restaurants_a1_a2.json';
import foodCafesRestaurantsB1B2 from './02_food_cafes_restaurants_b1_b2.json';
import travelDirectionsA1A2 from './03_travel_directions_a1_a2.json';
import travelDirectionsB1B2 from './03_travel_directions_b1_b2.json';
import workDailyRoutineA1A2 from './04_work_daily_routine_a1_a2.json';
import workDailyRoutineB1B2 from './04_work_daily_routine_b1_b2.json';
import homeFamilyRelationshipsA1A2 from './05_home_family_relationships_a1_a2.json';
import homeFamilyRelationshipsB1B2 from './05_home_family_relationships_b1_b2.json';
import healthAppointmentsA1A2 from './06_health_appointments_a1_a2.json';
import healthAppointmentsB1B2 from './06_health_appointments_b1_b2.json';
import shoppingMoneyA1A2 from './07_shopping_money_a1_a2.json';
import shoppingMoneyB1B2 from './07_shopping_money_b1_b2.json';
import emotionsOpinionsPersonalityA1A2 from './08_emotions_opinions_personality_a1_a2.json';
import emotionsOpinionsPersonalityB1B2 from './08_emotions_opinions_personality_b1_b2.json';
import grammarVerbsPatternsA1A2 from './09_grammar_verbs_patterns_a1_a2.json';
import grammarVerbsPatternsB1B2 from './09_grammar_verbs_patterns_b1_b2.json';
import cultureMediaConversationA1A2 from './10_culture_media_conversation_a1_a2.json';
import cultureMediaConversationB1B2 from './10_culture_media_conversation_b1_b2.json';

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
];

function enrichCards(cards, setId) {
  return cards.map((card) => ({
    ...card,
    setId,
  }));
}

export const flashcardSets = [
  {
    id: '01_greetings_social_a1_a2',
    subjectId: 'greetings-social',
    subject: 'Greetings & Social Basics',
    levelBand: 'A1-A2',
    cardCount: greetingsSocialA1A2.length,
    cards: enrichCards(greetingsSocialA1A2, '01_greetings_social_a1_a2'),
  },
  {
    id: '01_greetings_social_b1_b2',
    subjectId: 'greetings-social',
    subject: 'Greetings & Social Basics',
    levelBand: 'B1-B2',
    cardCount: greetingsSocialB1B2.length,
    cards: enrichCards(greetingsSocialB1B2, '01_greetings_social_b1_b2'),
  },
  {
    id: '02_food_cafes_restaurants_a1_a2',
    subjectId: 'food-cafes-restaurants',
    subject: 'Food, Cafes & Restaurants',
    levelBand: 'A1-A2',
    cardCount: foodCafesRestaurantsA1A2.length,
    cards: enrichCards(foodCafesRestaurantsA1A2, '02_food_cafes_restaurants_a1_a2'),
  },
  {
    id: '02_food_cafes_restaurants_b1_b2',
    subjectId: 'food-cafes-restaurants',
    subject: 'Food, Cafes & Restaurants',
    levelBand: 'B1-B2',
    cardCount: foodCafesRestaurantsB1B2.length,
    cards: enrichCards(foodCafesRestaurantsB1B2, '02_food_cafes_restaurants_b1_b2'),
  },
  {
    id: '03_travel_directions_a1_a2',
    subjectId: 'travel-directions',
    subject: 'Travel & Directions',
    levelBand: 'A1-A2',
    cardCount: travelDirectionsA1A2.length,
    cards: enrichCards(travelDirectionsA1A2, '03_travel_directions_a1_a2'),
  },
  {
    id: '03_travel_directions_b1_b2',
    subjectId: 'travel-directions',
    subject: 'Travel & Directions',
    levelBand: 'B1-B2',
    cardCount: travelDirectionsB1B2.length,
    cards: enrichCards(travelDirectionsB1B2, '03_travel_directions_b1_b2'),
  },
  {
    id: '04_work_daily_routine_a1_a2',
    subjectId: 'work-daily-routine',
    subject: 'Work & Daily Routine',
    levelBand: 'A1-A2',
    cardCount: workDailyRoutineA1A2.length,
    cards: enrichCards(workDailyRoutineA1A2, '04_work_daily_routine_a1_a2'),
  },
  {
    id: '04_work_daily_routine_b1_b2',
    subjectId: 'work-daily-routine',
    subject: 'Work & Daily Routine',
    levelBand: 'B1-B2',
    cardCount: workDailyRoutineB1B2.length,
    cards: enrichCards(workDailyRoutineB1B2, '04_work_daily_routine_b1_b2'),
  },
  {
    id: '05_home_family_relationships_a1_a2',
    subjectId: 'home-family-relationships',
    subject: 'Home, Family & Relationships',
    levelBand: 'A1-A2',
    cardCount: homeFamilyRelationshipsA1A2.length,
    cards: enrichCards(homeFamilyRelationshipsA1A2, '05_home_family_relationships_a1_a2'),
  },
  {
    id: '05_home_family_relationships_b1_b2',
    subjectId: 'home-family-relationships',
    subject: 'Home, Family & Relationships',
    levelBand: 'B1-B2',
    cardCount: homeFamilyRelationshipsB1B2.length,
    cards: enrichCards(homeFamilyRelationshipsB1B2, '05_home_family_relationships_b1_b2'),
  },
  {
    id: '06_health_appointments_a1_a2',
    subjectId: 'health-appointments',
    subject: 'Health & Appointments',
    levelBand: 'A1-A2',
    cardCount: healthAppointmentsA1A2.length,
    cards: enrichCards(healthAppointmentsA1A2, '06_health_appointments_a1_a2'),
  },
  {
    id: '06_health_appointments_b1_b2',
    subjectId: 'health-appointments',
    subject: 'Health & Appointments',
    levelBand: 'B1-B2',
    cardCount: healthAppointmentsB1B2.length,
    cards: enrichCards(healthAppointmentsB1B2, '06_health_appointments_b1_b2'),
  },
  {
    id: '07_shopping_money_a1_a2',
    subjectId: 'shopping-money',
    subject: 'Shopping & Money',
    levelBand: 'A1-A2',
    cardCount: shoppingMoneyA1A2.length,
    cards: enrichCards(shoppingMoneyA1A2, '07_shopping_money_a1_a2'),
  },
  {
    id: '07_shopping_money_b1_b2',
    subjectId: 'shopping-money',
    subject: 'Shopping & Money',
    levelBand: 'B1-B2',
    cardCount: shoppingMoneyB1B2.length,
    cards: enrichCards(shoppingMoneyB1B2, '07_shopping_money_b1_b2'),
  },
  {
    id: '08_emotions_opinions_personality_a1_a2',
    subjectId: 'emotions-opinions-personality',
    subject: 'Emotions, Opinions & Personality',
    levelBand: 'A1-A2',
    cardCount: emotionsOpinionsPersonalityA1A2.length,
    cards: enrichCards(
      emotionsOpinionsPersonalityA1A2,
      '08_emotions_opinions_personality_a1_a2'
    ),
  },
  {
    id: '08_emotions_opinions_personality_b1_b2',
    subjectId: 'emotions-opinions-personality',
    subject: 'Emotions, Opinions & Personality',
    levelBand: 'B1-B2',
    cardCount: emotionsOpinionsPersonalityB1B2.length,
    cards: enrichCards(
      emotionsOpinionsPersonalityB1B2,
      '08_emotions_opinions_personality_b1_b2'
    ),
  },
  {
    id: '09_grammar_verbs_patterns_a1_a2',
    subjectId: 'grammar-verbs-patterns',
    subject: 'Grammar Patterns & Verb Forms',
    levelBand: 'A1-A2',
    cardCount: grammarVerbsPatternsA1A2.length,
    cards: enrichCards(grammarVerbsPatternsA1A2, '09_grammar_verbs_patterns_a1_a2'),
  },
  {
    id: '09_grammar_verbs_patterns_b1_b2',
    subjectId: 'grammar-verbs-patterns',
    subject: 'Grammar Patterns & Verb Forms',
    levelBand: 'B1-B2',
    cardCount: grammarVerbsPatternsB1B2.length,
    cards: enrichCards(grammarVerbsPatternsB1B2, '09_grammar_verbs_patterns_b1_b2'),
  },
  {
    id: '10_culture_media_conversation_a1_a2',
    subjectId: 'culture-media-conversation',
    subject: 'Culture, Media & Conversation',
    levelBand: 'A1-A2',
    cardCount: cultureMediaConversationA1A2.length,
    cards: enrichCards(
      cultureMediaConversationA1A2,
      '10_culture_media_conversation_a1_a2'
    ),
  },
  {
    id: '10_culture_media_conversation_b1_b2',
    subjectId: 'culture-media-conversation',
    subject: 'Culture, Media & Conversation',
    levelBand: 'B1-B2',
    cardCount: cultureMediaConversationB1B2.length,
    cards: enrichCards(
      cultureMediaConversationB1B2,
      '10_culture_media_conversation_b1_b2'
    ),
  },
];

export const allFlashcards = flashcardSets.flatMap((set) => set.cards);
