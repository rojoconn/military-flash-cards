import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, Deck, Card, Review } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('army-flashcards.db');

  // Enable foreign keys and WAL mode for better performance
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Create tables
  await db.execAsync(CREATE_TABLES_SQL);

  return db;
}

// Generate UUID
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Deck operations
export async function createDeck(deck: Omit<Deck, 'id' | 'created_at' | 'updated_at' | 'card_count'>): Promise<Deck> {
  const database = await getDatabase();
  const now = Date.now();
  const id = generateId();

  await database.runAsync(
    `INSERT INTO decks (id, name, description, category, subcategory, card_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
    [id, deck.name, deck.description, deck.category, deck.subcategory, now, now]
  );

  return {
    ...deck,
    id,
    card_count: 0,
    created_at: now,
    updated_at: now,
  };
}

export async function getAllDecks(): Promise<Deck[]> {
  const database = await getDatabase();
  return database.getAllAsync<Deck>('SELECT * FROM decks ORDER BY name ASC');
}

export async function getDeckById(id: string): Promise<Deck | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Deck>('SELECT * FROM decks WHERE id = ?', [id]);
}

export async function getDecksByCategory(category: string): Promise<Deck[]> {
  const database = await getDatabase();
  return database.getAllAsync<Deck>(
    'SELECT * FROM decks WHERE category = ? ORDER BY name ASC',
    [category]
  );
}

export async function updateDeckCardCount(deckId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE decks SET card_count = (SELECT COUNT(*) FROM cards WHERE deck_id = ?), updated_at = ?
     WHERE id = ?`,
    [deckId, Date.now(), deckId]
  );
}

export async function deleteDeck(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM decks WHERE id = ?', [id]);
}

// Card operations
export async function createCard(card: Omit<Card, 'id' | 'created_at' | 'updated_at'>): Promise<Card> {
  const database = await getDatabase();
  const now = Date.now();
  const id = generateId();

  await database.runAsync(
    `INSERT INTO cards (id, deck_id, front, back, type, source_doc, source_page, source_para,
      due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review,
      created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, card.deck_id, card.front, card.back, card.type, card.source_doc, card.source_page,
      card.source_para ?? null,
      card.due, card.stability, card.difficulty, card.elapsed_days, card.scheduled_days,
      card.reps, card.lapses, card.state, card.last_review, now, now
    ]
  );

  // Update deck card count
  await updateDeckCardCount(card.deck_id);

  return {
    ...card,
    id,
    created_at: now,
    updated_at: now,
  };
}

export async function getCardsByDeck(deckId: string): Promise<Card[]> {
  const database = await getDatabase();
  return database.getAllAsync<Card>(
    'SELECT * FROM cards WHERE deck_id = ? ORDER BY due ASC',
    [deckId]
  );
}

export async function getDueCards(deckId: string, limit: number = 20): Promise<Card[]> {
  const database = await getDatabase();
  const now = Date.now();

  return database.getAllAsync<Card>(
    `SELECT * FROM cards
     WHERE deck_id = ? AND due <= ?
     ORDER BY
       CASE state
         WHEN 'new' THEN 0
         WHEN 'learning' THEN 1
         WHEN 'relearning' THEN 2
         WHEN 'review' THEN 3
       END,
       due ASC
     LIMIT ?`,
    [deckId, now, limit]
  );
}

export async function getAllDueCards(limit: number = 50): Promise<Card[]> {
  const database = await getDatabase();
  const now = Date.now();

  return database.getAllAsync<Card>(
    `SELECT * FROM cards
     WHERE due <= ?
     ORDER BY
       CASE state
         WHEN 'new' THEN 0
         WHEN 'learning' THEN 1
         WHEN 'relearning' THEN 2
         WHEN 'review' THEN 3
       END,
       due ASC
     LIMIT ?`,
    [now, limit]
  );
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<void> {
  const database = await getDatabase();
  const now = Date.now();

  const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'created_at');
  const values = fields.map(f => {
    const val = (updates as Record<string, unknown>)[f];
    // SQLite accepts string, number, null, or Uint8Array
    if (val === null || val === undefined) return null;
    if (typeof val === 'string' || typeof val === 'number') return val;
    return String(val);
  });

  const setClause = fields.map(f => `${f} = ?`).join(', ');

  await database.runAsync(
    `UPDATE cards SET ${setClause}, updated_at = ? WHERE id = ?`,
    [...values, now, id]
  );
}

export async function getCardById(id: string): Promise<Card | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Card>('SELECT * FROM cards WHERE id = ?', [id]);
}

export async function deleteCard(id: string, deckId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM cards WHERE id = ?', [id]);
  await updateDeckCardCount(deckId);
}

// Review operations
export async function createReview(review: Omit<Review, 'id'>): Promise<Review> {
  const database = await getDatabase();
  const id = generateId();

  await database.runAsync(
    `INSERT INTO reviews (id, card_id, deck_id, grade, time_spent_ms, reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, review.card_id, review.deck_id, review.grade, review.time_spent_ms, review.reviewed_at]
  );

  return { ...review, id };
}

export async function getReviewsByCard(cardId: string): Promise<Review[]> {
  const database = await getDatabase();
  return database.getAllAsync<Review>(
    'SELECT * FROM reviews WHERE card_id = ? ORDER BY reviewed_at DESC',
    [cardId]
  );
}

export async function getLastReviewByCard(cardId: string): Promise<Review | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Review>(
    'SELECT * FROM reviews WHERE card_id = ? ORDER BY reviewed_at DESC LIMIT 1',
    [cardId]
  );
}

export async function deleteReview(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM reviews WHERE id = ?', [id]);
}

export async function getTodayReviewCount(): Promise<number> {
  const database = await getDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();

  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reviews WHERE reviewed_at >= ?',
    [startOfDay]
  );

  return result?.count ?? 0;
}

// Stats
export async function getDeckStats(deckId: string): Promise<{
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
}> {
  const database = await getDatabase();
  const now = Date.now();

  const total = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards WHERE deck_id = ?',
    [deckId]
  );

  const newCards = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM cards WHERE deck_id = ? AND state = 'new'",
    [deckId]
  );

  const learning = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM cards WHERE deck_id = ? AND state IN ('learning', 'relearning')",
    [deckId]
  );

  const review = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM cards WHERE deck_id = ? AND state = 'review'",
    [deckId]
  );

  const due = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards WHERE deck_id = ? AND due <= ?',
    [deckId, now]
  );

  return {
    total: total?.count ?? 0,
    new: newCards?.count ?? 0,
    learning: learning?.count ?? 0,
    review: review?.count ?? 0,
    due: due?.count ?? 0,
  };
}

export async function getGlobalStats(): Promise<{
  totalDecks: number;
  totalCards: number;
  dueCards: number;
  reviewedToday: number;
}> {
  const database = await getDatabase();
  const now = Date.now();

  const totalDecks = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM decks'
  );

  const totalCards = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards'
  );

  const dueCards = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards WHERE due <= ?',
    [now]
  );

  const reviewedToday = await getTodayReviewCount();

  return {
    totalDecks: totalDecks?.count ?? 0,
    totalCards: totalCards?.count ?? 0,
    dueCards: dueCards?.count ?? 0,
    reviewedToday,
  };
}

// Bulk import for content loading - wrapped in transaction for atomicity
export async function bulkImportCards(deckId: string, cards: Array<{
  front: string;
  back: string;
  type?: 'qa' | 'fillblank' | 'image';
  source_doc?: string;
  source_page?: number;
  source_para?: string;
}>): Promise<number> {
  const database = await getDatabase();
  const now = Date.now();

  let imported = 0;

  await database.withTransactionAsync(async () => {
    for (const card of cards) {
      const id = generateId();
      await database.runAsync(
        `INSERT INTO cards (id, deck_id, front, back, type, source_doc, source_page, source_para,
          due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review,
          created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 'new', NULL, ?, ?)`,
        [
          id, deckId, card.front, card.back, card.type ?? 'qa',
          card.source_doc ?? null, card.source_page ?? null, card.source_para ?? null,
          now, now, now
        ]
      );
      imported++;
    }

    await updateDeckCardCount(deckId);
  });

  return imported;
}
