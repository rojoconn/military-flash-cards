import { createDeck, bulkImportCards, getAllDecks } from '../db/database';
import type { Deck } from '../db/schema';

// Sample deck data embedded for initial setup
// In production, this would load from JSON files or API

interface DeckImportData {
  deck: {
    name: string;
    description: string;
    category: Deck['category'];
    subcategory: string;
  };
  cards: Array<{
    front: string;
    back: string;
    source?: string;
  }>;
}

// M777 Operations deck
const M777_OPERATIONS: DeckImportData = {
  deck: {
    name: "M777A2 Pre-Fire Checks",
    description: "Essential pre-fire checks and procedures for the M777A2 Howitzer",
    category: "MOS",
    subcategory: "13B - Cannon Crewmember"
  },
  cards: [
    {
      front: "What is the first step in performing M777A2 pre-fire checks?",
      back: "Ensure the weapon is in SAFE mode and the breech is clear of all ammunition and obstructions.",
      source: "TC_3_09.81_FA Manual Cannon Battery.pdf"
    },
    {
      front: "What is the maximum effective range of the M777A2 with standard ammunition?",
      back: "22 kilometers (approximately 13.7 miles) with standard ammunition. Up to 30km with rocket-assisted projectiles.",
      source: "FM_6_40_TTP FOR FA MANUAL GUNNERY.pdf"
    },
    {
      front: "What caliber is the M777A2 Howitzer?",
      back: "155mm",
      source: "TM_9_1025_215_10_M777A2 OPERATOR MANUAL.pdf"
    },
    {
      front: "What is the weight of the M777A2 Howitzer?",
      back: "Approximately 9,300 pounds (4,218 kg), making it the lightest 155mm towed howitzer in the world.",
      source: "TM_9_1025_215_10_M777A2 OPERATOR MANUAL.pdf"
    },
    {
      front: "What does DFCS stand for in the M777A2?",
      back: "Digital Fire Control System",
      source: "TC_3_09.81_FA Manual Cannon Battery.pdf"
    },
    {
      front: "What is the maximum rate of fire for the M777A2?",
      back: "5 rounds per minute maximum, 2 rounds per minute sustained.",
      source: "FM_6_50_FIELD ARTILLERY CANNON BATTERY.pdf"
    },
    {
      front: "What crew size is required for the M777A2?",
      back: "Minimum crew of 5, optimal crew of 8 personnel.",
      source: "FM_6_50_FIELD ARTILLERY CANNON BATTERY.pdf"
    },
    {
      front: "What does CEP stand for in artillery terms?",
      back: "Circular Error Probable - the radius of a circle within which 50% of rounds will land.",
      source: "FM_6_40_TTP FOR FA MANUAL GUNNERY.pdf"
    },
    {
      front: "What immediate action should be taken in case of a misfire?",
      back: "Wait 30 seconds (hangfire interval), then announce 'MISFIRE' and follow unit SOP for misfire procedures.",
      source: "TC_3_09.81_FA Manual Cannon Battery.pdf"
    },
    {
      front: "What is the hangfire interval for artillery?",
      back: "30 seconds - the minimum time to wait before opening the breech after a misfire to allow for a potential hangfire.",
      source: "TC_3_09.81_FA Manual Cannon Battery.pdf"
    }
  ]
};

// ASPT Tasks deck
const ASPT_TASKS: DeckImportData = {
  deck: {
    name: "13B ASPT Tasks",
    description: "Annual Skill Proficiency Test tasks for 13B Cannon Crewmember",
    category: "STP",
    subcategory: "13B ASPT"
  },
  cards: [
    {
      front: "What are the steps to set up the M2A2 Aiming Circle?",
      back: "1. Select a level position\n2. Extend tripod legs and level the tripod head\n3. Mount the aiming circle on the tripod\n4. Center the circular level\n5. Center the tubular level\n6. Verify orientation if required",
      source: "061-266-4000_Set up the M2 or M2A2 Aiming Circle.pdf"
    },
    {
      front: "What is the purpose of the M2A2 Aiming Circle?",
      back: "To measure horizontal and vertical angles, lay howitzers for direction, and establish the azimuth of an orienting line for artillery operations.",
      source: "061-266-4000_Set up the M2 or M2A2 Aiming Circle.pdf"
    },
    {
      front: "What is a Distant Aiming Point (DAP)?",
      back: "A clearly defined point at least 1,500 meters away used to verify boresight and lay the howitzer for direction.",
      source: "061-266-2238_Establish a Distant Aiming Point.pdf"
    },
    {
      front: "What is the purpose of a Range Card for a Howitzer?",
      back: "To record data needed for direct fire engagement, including aiming points, deflection and elevation settings, and range to targets in the sector.",
      source: "061-266-3313_Prepare a Range Card for a Howitzer.pdf"
    },
    {
      front: "What is the purpose of referring a piece?",
      back: "To verify or reestablish the lay of a howitzer by comparing the current sight reading to a recorded reading on an aiming point.",
      source: "061-266-2231_Refer a Piece.pdf"
    },
    {
      front: "What is minimum quadrant elevation (QE)?",
      back: "The lowest safe quadrant elevation at which the howitzer can fire without the projectile striking the crest in front of the weapon position.",
      source: "061-266-4009_Compute Position Minimum Quadrant Elevation.pdf"
    },
    {
      front: "What is a reciprocal lay?",
      back: "A method of laying the howitzer for initial direction using the aiming circle where the circle observes the weapon and the weapon observes the circle simultaneously.",
      source: "061-266-2002_Lay a Howitzer for Initial Direction by Reciprocal Lay with a PANTEL.pdf"
    },
    {
      front: "How do you prepare a 155mm round for firing?",
      back: "1. Inspect projectile for damage\n2. Set and install fuze\n3. Verify propellant charge\n4. Check primer\n5. Announce 'ROUND READY' when complete",
      source: "061-13B-1001_Prepare a 155MM Round for Firing (M777A2).pdf"
    }
  ]
};

// All sample decks
const SAMPLE_DECKS: DeckImportData[] = [M777_OPERATIONS, ASPT_TASKS];

/**
 * Import sample decks into the database.
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

  for (const deckData of SAMPLE_DECKS) {
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
          source_doc: c.source,
        }))
      );

      imported++;
    } catch {
      // Skip failed deck import, continue with others
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
      category: data.deck.category || 'MOS',
      subcategory: data.deck.subcategory || '',
    });

    const cardCount = await bulkImportCards(
      deck.id,
      data.cards.map(c => ({
        front: c.front,
        back: c.back,
        type: 'qa' as const,
        source_doc: c.source,
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
