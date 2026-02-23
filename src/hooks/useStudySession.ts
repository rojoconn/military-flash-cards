import { useState, useCallback, useEffect } from 'react';
import type { Card } from '../db/schema';
import { getDueCards, getAllDueCards, getCardById, getLastReviewByCard, deleteReview, updateCard, updateUserProgress } from '../db/database';
import { processReview, getSchedulingOptions, type SchedulingOption } from '../services/fsrs';

interface StudySessionState {
  cards: Card[];
  currentIndex: number;
  currentCard: Card | null;
  showAnswer: boolean;
  schedulingOptions: SchedulingOption[];
  isLoading: boolean;
  isComplete: boolean;
  stats: {
    reviewed: number;
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  startTime: number;
  // Store previous card states for proper undo (restores FSRS state)
  previousCardStates: Card[];
}

export function useStudySession(deckId?: string) {
  const [state, setState] = useState<StudySessionState>({
    cards: [],
    currentIndex: 0,
    currentCard: null,
    showAnswer: false,
    schedulingOptions: [],
    isLoading: true,
    isComplete: false,
    stats: { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 },
    startTime: Date.now(),
    previousCardStates: [],
  });

  // Load due cards
  const loadCards = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const cards = deckId && deckId !== 'all'
        ? await getDueCards(deckId, 50)
        : await getAllDueCards(50);

      if (cards.length === 0) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isComplete: true,
        }));
        return;
      }

      const currentCard = cards[0];
      const schedulingOptions = getSchedulingOptions(currentCard);

      setState(prev => ({
        ...prev,
        cards,
        currentIndex: 0,
        currentCard,
        schedulingOptions,
        showAnswer: false,
        isLoading: false,
        isComplete: false,
        startTime: Date.now(),
      }));
    } catch {
      // Silently fail - shows empty state to user
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [deckId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Flip card to show answer
  const flipCard = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAnswer: true,
    }));
  }, []);

  // Grade the current card and move to next
  const gradeCard = useCallback(async (grade: 1 | 2 | 3 | 4) => {
    const { currentCard, cards, currentIndex, stats, startTime, previousCardStates } = state;

    if (!currentCard) return;

    const timeSpent = Date.now() - startTime;

    try {
      // Store the current card state BEFORE processing (for undo)
      const cardStateBeforeGrade = { ...currentCard };

      // Process the review (updates card in DB and creates review record)
      await processReview(currentCard, grade, timeSpent);

      // Update user progress (streaks, achievements)
      await updateUserProgress(1);

      // Update stats
      const gradeKey = grade === 1 ? 'again' : grade === 2 ? 'hard' : grade === 3 ? 'good' : 'easy';
      const newStats = {
        ...stats,
        reviewed: stats.reviewed + 1,
        [gradeKey]: stats[gradeKey] + 1,
      };

      // Move to next card
      const nextIndex = currentIndex + 1;

      if (nextIndex >= cards.length) {
        // Session complete
        setState(prev => ({
          ...prev,
          stats: newStats,
          isComplete: true,
          currentCard: null,
          showAnswer: false,
          previousCardStates: [...previousCardStates, cardStateBeforeGrade],
        }));
        return;
      }

      // Load next card
      const nextCard = cards[nextIndex];
      const schedulingOptions = getSchedulingOptions(nextCard);

      setState(prev => ({
        ...prev,
        currentIndex: nextIndex,
        currentCard: nextCard,
        schedulingOptions,
        showAnswer: false,
        stats: newStats,
        startTime: Date.now(),
        previousCardStates: [...previousCardStates, cardStateBeforeGrade],
      }));
    } catch {
      // Grade failed - card stays on current, user can retry
    }
  }, [state]);

  // Undo last grade (go back to previous card, restore FSRS state, delete review from DB)
  const undoLastGrade = useCallback(async () => {
    const { currentIndex, cards, previousCardStates } = state;

    if (currentIndex <= 0 || previousCardStates.length === 0) return;

    const prevIndex = currentIndex - 1;
    const prevCard = cards[prevIndex];

    // Get the saved state from before the grade
    const savedCardState = previousCardStates[previousCardStates.length - 1];

    try {
      // Delete the most recent review for this card from database
      const lastReview = await getLastReviewByCard(prevCard.id);
      if (lastReview) {
        await deleteReview(lastReview.id);
      }

      // CRITICAL: Restore the card's FSRS state to what it was before grading
      await updateCard(savedCardState.id, {
        due: savedCardState.due,
        stability: savedCardState.stability,
        difficulty: savedCardState.difficulty,
        elapsed_days: savedCardState.elapsed_days,
        scheduled_days: savedCardState.scheduled_days,
        reps: savedCardState.reps,
        lapses: savedCardState.lapses,
        state: savedCardState.state,
        last_review: savedCardState.last_review,
      });

      const schedulingOptions = getSchedulingOptions(savedCardState);

      setState(prev => ({
        ...prev,
        currentIndex: prevIndex,
        currentCard: savedCardState,
        schedulingOptions,
        showAnswer: false,
        stats: {
          ...prev.stats,
          reviewed: Math.max(0, prev.stats.reviewed - 1),
        },
        startTime: Date.now(),
        // Remove the last saved state since we used it
        previousCardStates: previousCardStates.slice(0, -1),
      }));
    } catch {
      // Undo failed - silently ignore, user stays on current card
    }
  }, [state]);

  // Restart session
  const restartSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: 0,
      currentCard: prev.cards[0] || null,
      schedulingOptions: prev.cards[0] ? getSchedulingOptions(prev.cards[0]) : [],
      showAnswer: false,
      isComplete: false,
      stats: { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 },
      startTime: Date.now(),
      previousCardStates: [], // Reset undo history on restart
    }));
  }, []);

  return {
    ...state,
    totalCards: state.cards.length,
    progress: state.cards.length > 0
      ? Math.round((state.currentIndex / state.cards.length) * 100)
      : 0,
    flipCard,
    gradeCard,
    undoLastGrade,
    restartSession,
    reload: loadCards,
  };
}
