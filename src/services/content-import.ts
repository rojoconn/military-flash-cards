import { createDeck, bulkImportCards, getAllDecks } from '../db/database';
import type { Deck } from '../db/schema';

// Import all deck JSON files
import soldiersGuide from '../../content/decks/tc-7-21-13-soldiers-guide-expanded.json';
import landNav from '../../content/decks/tc-3-25-26-land-nav-expanded.json';
import rifleCarbine from '../../content/decks/tc-3-22-9-rifle-carbine-expanded.json';
import ncoGuide from '../../content/decks/tc-7-22-7-nco-guide-expanded.json';
import physicalReadiness from '../../content/decks/fm-7-22-physical-readiness-expanded.json';
import commonTasks from '../../content/decks/stp-21-1-common-tasks-expanded.json';
import firstAid from '../../content/decks/tc-4-02-first-aid-expanded.json';

interface DeckImportData {
  deck: {
    name: string;
    description: string;
    category: Deck['category'];
    subcategory: string;
  };
  metadata?: {
    publication?: string;
    publications?: string[];
    title?: string;
    date?: string;
    proponent?: string;
  };
  cards: Array<{
    front: string;
    back: string;
    source_doc?: string;
    source_page?: number;
    source_para?: string;
  }>;
}

// All expanded decks
const ALL_DECKS: DeckImportData[] = [
  soldiersGuide as DeckImportData,
  landNav as DeckImportData,
  rifleCarbine as DeckImportData,
  ncoGuide as DeckImportData,
  physicalReadiness as DeckImportData,
  commonTasks as DeckImportData,
  firstAid as DeckImportData,
];

/**
 * Import all decks into the database.
 * Only imports decks that don't already exist (by name).
 */
export async function importSampleDecks(): Promise<{
  imported: number;
  skipped: number;
}> {
  const existingDecks = await getAllDecks();
  const existingNames = new Set(existingDecks.map(d => d.name));

  let imported = 0;
  let skipped = 0;

  for (const deckData of ALL_DECKS) {
    if (existingNames.has(deckData.deck.name)) {
      skipped++;
      continue;
    }

    try {
      // Create the deck
      const deck = await createDeck({
        name: deckData.deck.name,
        description: deckData.deck.description,
        category: deckData.deck.category,
        subcategory: deckData.deck.subcategory,
      });

      // Import cards
      await bulkImportCards(
        deck.id,
        deckData.cards.map(c => ({
          front: c.front,
          back: c.back,
          type: 'qa' as const,
          source_doc: c.source_doc,
          source_page: c.source_page,
          source_para: c.source_para,
        }))
      );

      imported++;
    } catch (err) {
      console.error(`Failed to import deck "${deckData.deck.name}":`, err);
    }
  }

  return { imported, skipped };
}

/**
 * Import a custom deck from JSON data.
 */
export async function importDeckFromJson(json: string): Promise<{
  success: boolean;
  deckId?: string;
  cardCount?: number;
  error?: string;
}> {
  try {
    const data: DeckImportData = JSON.parse(json);

    if (!data.deck?.name || !Array.isArray(data.cards)) {
      return { success: false, error: 'Invalid deck format' };
    }

    const deck = await createDeck({
      name: data.deck.name,
      description: data.deck.description || '',
      category: data.deck.category || 'TC',
      subcategory: data.deck.subcategory || '',
    });

    const cardCount = await bulkImportCards(
      deck.id,
      data.cards.map(c => ({
        front: c.front,
        back: c.back,
        type: 'qa' as const,
        source_doc: c.source_doc,
        source_page: c.source_page,
        source_para: c.source_para,
      }))
    );

    return { success: true, deckId: deck.id, cardCount };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Force reimport all decks (deletes existing and reimports)
 */
export async function reimportAllDecks(): Promise<{
  imported: number;
  totalCards: number;
}> {
  let imported = 0;
  let totalCards = 0;

  for (const deckData of ALL_DECKS) {
    try {
      const deck = await createDeck({
        name: deckData.deck.name,
        description: deckData.deck.description,
        category: deckData.deck.category,
        subcategory: deckData.deck.subcategory,
      });

      const cardCount = await bulkImportCards(
        deck.id,
        deckData.cards.map(c => ({
          front: c.front,
          back: c.back,
          type: 'qa' as const,
          source_doc: c.source_doc,
          source_page: c.source_page,
          source_para: c.source_para,
        }))
      );

      imported++;
      totalCards += cardCount;
    } catch (err) {
      console.error(`Failed to import deck "${deckData.deck.name}":`, err);
    }
  }

  return { imported, totalCards };
}
