import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme';
import { getGlobalStats, getAllDueCards, getAllDecks } from '../../src/db/database';
import type { Card, Deck } from '../../src/db/schema';

export default function StudyScreen() {
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    dueCards: 0,
    reviewedToday: 0,
  });
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [globalStats, due, allDecks] = await Promise.all([
        getGlobalStats(),
        getAllDueCards(10),
        getAllDecks(),
      ]);
      setStats(globalStats);
      setDueCards(due);
      setDecks(allDecks);
    } catch {
      // Load failed - shows empty state, user can pull to refresh
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDeckForCard = (card: Card): Deck | undefined => {
    return decks.find(d => d.id === card.deck_id);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.dueCards}</Text>
          <Text style={styles.statLabel}>Due Now</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.reviewedToday}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCards}</Text>
          <Text style={styles.statLabel}>Total Cards</Text>
        </View>
      </View>

      {/* Quick Study Button */}
      {stats.dueCards > 0 && (
        <Link href="/study/all" asChild>
          <TouchableOpacity style={styles.studyButton}>
            <Text style={styles.studyButtonText}>
              Study All Due Cards ({stats.dueCards})
            </Text>
          </TouchableOpacity>
        </Link>
      )}

      {/* Due Cards Preview */}
      {dueCards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          {dueCards.slice(0, 5).map((card) => {
            const deck = getDeckForCard(card);
            return (
              <View key={card.id} style={styles.cardPreview}>
                <Text style={styles.cardQuestion} numberOfLines={2}>
                  {card.front}
                </Text>
                <Text style={styles.cardDeck}>
                  {deck?.name || 'Unknown Deck'}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Empty State */}
      {stats.totalCards === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎖️</Text>
          <Text style={styles.emptyTitle}>No Flashcards Yet</Text>
          <Text style={styles.emptyText}>
            Go to the Decks tab to create your first deck and add flashcards.
          </Text>
          <Link href="/decks" asChild>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Browse Decks</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}

      {/* All caught up */}
      {stats.totalCards > 0 && stats.dueCards === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>
            You've reviewed all due cards. Check back later or add more cards.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  studyButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  studyButtonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardPreview: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  cardQuestion: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDeck: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  createButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
