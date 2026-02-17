import { FSRS, Rating, Grade, State, createEmptyCard } from 'ts-fsrs';
import { updateCard, createReview } from '../db/database';
import type { Card } from '../db/schema';

// Initialize FSRS with default parameters optimized for military training
const fsrs = new FSRS({
  // Request retention - target 90% for military procedures
  request_retention: 0.9,
  // Maximum interval of 365 days
  maximum_interval: 365,
  // Enable fuzz factor for natural scheduling
  enable_fuzz: true,
});

// Map our grade (1-4) to FSRS Rating
export function gradeToRating(grade: 1 | 2 | 3 | 4): Rating {
  switch (grade) {
    case 1: return Rating.Again;
    case 2: return Rating.Hard;
    case 3: return Rating.Good;
    case 4: return Rating.Easy;
  }
}

// Map our state to FSRS State
export function stateToFSRSState(state: Card['state']): State {
  switch (state) {
    case 'new': return State.New;
    case 'learning': return State.Learning;
    case 'review': return State.Review;
    case 'relearning': return State.Relearning;
    default: return State.New;
  }
}

// Map FSRS State back to our state
export function fsrsStateToState(state: State): Card['state'] {
  switch (state) {
    case State.New: return 'new';
    case State.Learning: return 'learning';
    case State.Review: return 'review';
    case State.Relearning: return 'relearning';
    default: return 'new';
  }
}

// Convert our Card to FSRS Card
export function cardToFSRSCard(card: Card) {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: stateToFSRSState(card.state),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
    learning_steps: 0, // Required by ts-fsrs
  };
}

// Get scheduling options for a card (preview what each grade would do)
export interface SchedulingOption {
  grade: 1 | 2 | 3 | 4;
  label: string;
  nextDue: Date;
  interval: string;
}

export function getSchedulingOptions(card: Card): SchedulingOption[] {
  const fsrsCard = cardToFSRSCard(card);
  const now = new Date();

  // Use next() for single rating scheduling
  const againResult = fsrs.next(fsrsCard, now, Rating.Again);
  const hardResult = fsrs.next(fsrsCard, now, Rating.Hard);
  const goodResult = fsrs.next(fsrsCard, now, Rating.Good);
  const easyResult = fsrs.next(fsrsCard, now, Rating.Easy);

  return [
    {
      grade: 1,
      label: 'Again',
      nextDue: againResult.card.due,
      interval: formatInterval(againResult.card.due, now),
    },
    {
      grade: 2,
      label: 'Hard',
      nextDue: hardResult.card.due,
      interval: formatInterval(hardResult.card.due, now),
    },
    {
      grade: 3,
      label: 'Good',
      nextDue: goodResult.card.due,
      interval: formatInterval(goodResult.card.due, now),
    },
    {
      grade: 4,
      label: 'Easy',
      nextDue: easyResult.card.due,
      interval: formatInterval(easyResult.card.due, now),
    },
  ];
}

// Format interval for display
export function formatInterval(due: Date, now: Date): string {
  const diffMs = due.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '<1m';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}d`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)}mo`;
  return `${Math.round(diffDays / 365)}y`;
}

// Process a review and update the card
export async function processReview(
  card: Card,
  grade: 1 | 2 | 3 | 4,
  timeSpentMs: number
): Promise<Card> {
  const fsrsCard = cardToFSRSCard(card);
  const now = new Date();
  const rating = gradeToRating(grade);

  // Get the scheduling result for this rating - cast Rating to Grade
  const result = fsrs.next(fsrsCard, now, rating as unknown as Grade);
  const scheduledCard = result.card;

  // Update the card in the database
  const updates: Partial<Card> = {
    due: scheduledCard.due.getTime(),
    stability: scheduledCard.stability,
    difficulty: scheduledCard.difficulty,
    elapsed_days: scheduledCard.elapsed_days,
    scheduled_days: scheduledCard.scheduled_days,
    reps: scheduledCard.reps,
    lapses: scheduledCard.lapses,
    state: fsrsStateToState(scheduledCard.state),
    last_review: now.getTime(),
  };

  await updateCard(card.id, updates);

  // Create a review record
  await createReview({
    card_id: card.id,
    deck_id: card.deck_id,
    grade,
    time_spent_ms: timeSpentMs,
    reviewed_at: now.getTime(),
  });

  return {
    ...card,
    ...updates,
    updated_at: Date.now(),
  };
}

// Create a new card with default FSRS state
export function getNewCardDefaults(): Pick<Card, 'due' | 'stability' | 'difficulty' | 'elapsed_days' | 'scheduled_days' | 'reps' | 'lapses' | 'state' | 'last_review'> {
  const empty = createEmptyCard();

  return {
    due: empty.due.getTime(),
    stability: empty.stability,
    difficulty: empty.difficulty,
    elapsed_days: empty.elapsed_days,
    scheduled_days: empty.scheduled_days,
    reps: empty.reps,
    lapses: empty.lapses,
    state: 'new',
    last_review: null,
  };
}

// Get retrievability (probability of recall) for a card
export function getRetrievability(card: Card): number {
  if (card.state === 'new') return 1;

  const fsrsCard = cardToFSRSCard(card);
  const retrievability = fsrs.get_retrievability(fsrsCard, new Date());
  return typeof retrievability === 'number' ? retrievability : 1;
}

// Grade labels for UI
export const GRADE_LABELS = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
} as const;

export const GRADE_DESCRIPTIONS = {
  1: 'Complete blackout, wrong answer',
  2: 'Correct but with difficulty',
  3: 'Correct with some hesitation',
  4: 'Instant and confident recall',
} as const;
