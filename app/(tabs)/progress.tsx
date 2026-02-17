import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme';
import { getGlobalStats, getAllDecks, getDeckStats } from '../../src/db/database';
import type { Deck } from '../../src/db/schema';

interface DeckWithProgress extends Deck {
  stats: {
    total: number;
    new: number;
    learning: number;
    review: number;
    due: number;
  };
}

export default function ProgressScreen() {
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    dueCards: 0,
    reviewedToday: 0,
  });
  const [decksProgress, setDecksProgress] = useState<DeckWithProgress[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [globalStats, allDecks] = await Promise.all([
        getGlobalStats(),
        getAllDecks(),
      ]);

      const decksWithStats = await Promise.all(
        allDecks.map(async (deck) => ({
          ...deck,
          stats: await getDeckStats(deck.id),
        }))
      );

      setStats(globalStats);
      setDecksProgress(decksWithStats);
    } catch (err) {
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

  const calculateMasteryProgress = () => {
    const totalReview = decksProgress.reduce((acc, d) => acc + d.stats.review, 0);
    const totalCards = decksProgress.reduce((acc, d) => acc + d.stats.total, 0);
    if (totalCards === 0) return 0;
    return Math.round((totalReview / totalCards) * 100);
  };

  const masteryProgress = calculateMasteryProgress();

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
      {/* Overall Progress */}
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>Overall Mastery</Text>
        <View style={styles.progressRing}>
          <Text style={styles.progressValue}>{masteryProgress}%</Text>
        </View>
        <Text style={styles.progressSubtext}>
          Cards in review state
        </Text>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.reviewedToday}</Text>
            <Text style={styles.statLabel}>Reviewed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.dueCards}</Text>
            <Text style={styles.statLabel}>Due</Text>
          </View>
        </View>
      </View>

      {/* Deck Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deck Progress</Text>
        {decksProgress.map((deck) => {
          const progress = deck.stats.total > 0
            ? Math.round((deck.stats.review / deck.stats.total) * 100)
            : 0;

          return (
            <View key={deck.id} style={styles.deckProgress}>
              <View style={styles.deckHeader}>
                <Text style={styles.deckName}>{deck.name}</Text>
                <Text style={styles.deckPercent}>{progress}%</Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>

              <View style={styles.deckStatsRow}>
                <View style={styles.deckStat}>
                  <View style={[styles.statDot, { backgroundColor: colors.cardNew }]} />
                  <Text style={styles.deckStatText}>New: {deck.stats.new}</Text>
                </View>
                <View style={styles.deckStat}>
                  <View style={[styles.statDot, { backgroundColor: colors.cardLearning }]} />
                  <Text style={styles.deckStatText}>Learning: {deck.stats.learning}</Text>
                </View>
                <View style={styles.deckStat}>
                  <View style={[styles.statDot, { backgroundColor: colors.cardReview }]} />
                  <Text style={styles.deckStatText}>Review: {deck.stats.review}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {decksProgress.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Create some decks to see your progress here.
            </Text>
          </View>
        )}
      </View>

      {/* Summary Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Library</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalDecks}</Text>
            <Text style={styles.summaryLabel}>Decks</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalCards}</Text>
            <Text style={styles.summaryLabel}>Cards</Text>
          </View>
        </View>
      </View>
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
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  overviewTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  progressSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  deckProgress: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deckName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  deckPercent: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  deckStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  deckStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  deckStatText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
