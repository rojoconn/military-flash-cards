// Database schema definitions for Army Flashcards

export interface Deck {
  id: string;
  name: string;
  description: string;
  category: 'AR' | 'FM' | 'MOS' | 'TC' | 'ATP' | 'STP';
  subcategory: string;
  card_count: number;
  created_at: number;
  updated_at: number;
}

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  type: 'qa' | 'fillblank' | 'image';
  source_doc: string | null;      // Publication number (e.g., "TC 7-21.13")
  source_page: number | null;      // Page number
  source_para: string | null;      // Paragraph/section reference (e.g., "Chapter 3, para 3-12")

  // FSRS State
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  last_review: number | null;

  created_at: number;
  updated_at: number;
}

export interface Review {
  id: string;
  card_id: string;
  deck_id: string;
  grade: 1 | 2 | 3 | 4;  // Again, Hard, Good, Easy
  time_spent_ms: number;
  reviewed_at: number;
}

export interface StudyStats {
  id: string;
  date: string;  // YYYY-MM-DD
  cards_reviewed: number;
  cards_new: number;
  cards_relearning: number;
  total_time_ms: number;
  average_grade: number;
}

export interface UserProgress {
  id: string;
  current_streak: number;
  longest_streak: number;
  total_cards_reviewed: number;
  total_study_days: number;
  last_study_date: string | null;  // YYYY-MM-DD
  daily_goal: number;  // Cards per day goal
  created_at: number;
  updated_at: number;
}

export interface Achievement {
  id: string;
  key: string;  // Unique identifier like 'first_card', 'streak_7', etc.
  name: string;
  description: string;
  icon: string;  // Emoji
  unlocked_at: number | null;
}

export const ACHIEVEMENTS = [
  { key: 'first_card', name: 'First Steps', description: 'Review your first card', icon: '🎯' },
  { key: 'cards_10', name: 'Getting Started', description: 'Review 10 cards', icon: '📚' },
  { key: 'cards_50', name: 'Dedicated Learner', description: 'Review 50 cards', icon: '🌟' },
  { key: 'cards_100', name: 'Century Club', description: 'Review 100 cards', icon: '💯' },
  { key: 'cards_500', name: 'Knowledge Seeker', description: 'Review 500 cards', icon: '🧠' },
  { key: 'cards_1000', name: 'Scholar', description: 'Review 1000 cards', icon: '🎓' },
  { key: 'streak_3', name: 'On a Roll', description: '3 day study streak', icon: '🔥' },
  { key: 'streak_7', name: 'Week Warrior', description: '7 day study streak', icon: '⚡' },
  { key: 'streak_14', name: 'Two Week Titan', description: '14 day study streak', icon: '💪' },
  { key: 'streak_30', name: 'Month Master', description: '30 day study streak', icon: '🏆' },
  { key: 'perfect_10', name: 'Perfect Ten', description: '10 cards in a row without "Back of Deck"', icon: '✨' },
  { key: 'speed_demon', name: 'Speed Demon', description: 'Review 20 cards in under 2 minutes', icon: '⚡' },
  { key: 'early_bird', name: 'Early Bird', description: 'Study before 6 AM', icon: '🌅' },
  { key: 'night_owl', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉' },
  { key: 'category_master', name: 'Category Master', description: 'Complete all due cards in a category', icon: '🎖️' },
] as const;

// SQL statements for creating tables
export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('AR', 'FM', 'MOS', 'TC', 'ATP', 'STP')),
    subcategory TEXT DEFAULT '',
    card_count INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    deck_id TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'qa' CHECK (type IN ('qa', 'fillblank', 'image')),
    source_doc TEXT,
    source_page INTEGER,
    source_para TEXT,

    -- FSRS State
    due INTEGER NOT NULL,
    stability REAL NOT NULL DEFAULT 0,
    difficulty REAL NOT NULL DEFAULT 0,
    elapsed_days REAL NOT NULL DEFAULT 0,
    scheduled_days REAL NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    state TEXT NOT NULL DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'relearning')),
    last_review INTEGER,

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
  CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(due);
  CREATE INDEX IF NOT EXISTS idx_cards_state ON cards(state);

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    deck_id TEXT NOT NULL,
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 4),
    time_spent_ms INTEGER NOT NULL,
    reviewed_at INTEGER NOT NULL,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_card_id ON reviews(card_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at ON reviews(reviewed_at);

  CREATE TABLE IF NOT EXISTS study_stats (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    cards_reviewed INTEGER NOT NULL DEFAULT 0,
    cards_new INTEGER NOT NULL DEFAULT 0,
    cards_relearning INTEGER NOT NULL DEFAULT 0,
    total_time_ms INTEGER NOT NULL DEFAULT 0,
    average_grade REAL NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_study_stats_date ON study_stats(date);

  CREATE TABLE IF NOT EXISTS user_progress (
    id TEXT PRIMARY KEY,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    total_cards_reviewed INTEGER NOT NULL DEFAULT 0,
    total_study_days INTEGER NOT NULL DEFAULT 0,
    last_study_date TEXT,
    daily_goal INTEGER NOT NULL DEFAULT 20,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    unlocked_at INTEGER
  );
`;
