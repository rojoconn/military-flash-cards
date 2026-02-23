import { useState, useCallback } from 'react';
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
import {
  getGlobalStats,
  getUserProgress,
  getStreakInfo,
} from '../../src/db/database';

const MOTIVATIONAL_MESSAGES = [
  "Train hard, fight easy.",
  "Excellence is not a skill. It's an attitude.",
  "The more you sweat in training, the less you bleed in combat.",
  "Be all you can be.",
  "Mission first, people always.",
  "Lead from the front.",
  "Stay sharp, stay ready.",
  "Knowledge is your greatest weapon.",
];

export default function StudyScreen() {
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalCards: 0,
    dueCards: 0,
    reviewedToday: 0,
  });
  const [streak, setStreak] = useState({ current: 0, longest: 0, isActiveToday: false });
  const [dailyGoal, setDailyGoal] = useState(20);
  const [refreshing, setRefreshing] = useState(false);
  const [motivationalMessage] = useState(
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  const loadData = useCallback(async () => {
    try {
      const [globalStats, streakInfo, progress] = await Promise.all([
        getGlobalStats(),
        getStreakInfo(),
        getUserProgress(),
      ]);
      setStats(globalStats);
      setStreak(streakInfo);
      setDailyGoal(progress.daily_goal);
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

  const dailyProgress = Math.min((stats.reviewedToday / dailyGoal) * 100, 100);
  const cardsToGoal = Math.max(dailyGoal - stats.reviewedToday, 0);

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
      {/* Streak & Daily Progress */}
      <View style={styles.heroSection}>
        {/* Streak Display */}
        <View style={styles.streakContainer}>
          <Text style={styles.streakFlame}>{streak.current > 0 ? '🔥' : '💤'}</Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{streak.current}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          {streak.current > 0 && streak.current === streak.longest && (
            <Text style={styles.personalBest}>Personal Best!</Text>
          )}
        </View>

        {/* Daily Progress Ring */}
        <View style={styles.progressRingContainer}>
          <View style={styles.progressRing}>
            <View style={[styles.progressFill, { height: `${dailyProgress}%` }]} />
            <View style={styles.progressContent}>
              <Text style={styles.progressNumber}>{stats.reviewedToday}</Text>
              <Text style={styles.progressLabel}>/ {dailyGoal}</Text>
            </View>
          </View>
          <Text style={styles.progressTitle}>
            {dailyProgress >= 100 ? 'Goal Complete!' : 'Daily Goal'}
          </Text>
        </View>
      </View>

      {/* Today's Mission */}
      <View style={styles.missionCard}>
        <Text style={styles.missionTitle}>Today's Mission</Text>
        {stats.dueCards > 0 ? (
          <>
            <Text style={styles.missionText}>
              {cardsToGoal > 0
                ? `Review ${Math.min(cardsToGoal, stats.dueCards)} cards to hit your daily goal`
                : `You've hit your goal! ${stats.dueCards} cards still due.`}
            </Text>
            <Link href="/study/all" asChild>
              <TouchableOpacity style={styles.missionButton}>
                <Text style={styles.missionButtonText}>
                  {dailyProgress >= 100 ? 'Keep Going' : 'Start Training'}
                </Text>
              </TouchableOpacity>
            </Link>
          </>
        ) : stats.totalCards > 0 ? (
          <>
            <Text style={styles.missionComplete}>All caught up, Soldier!</Text>
            <Text style={styles.missionSubtext}>Check back later for more reviews.</Text>
          </>
        ) : (
          <>
            <Text style={styles.missionText}>Import decks to begin your training.</Text>
            <Link href="/decks" asChild>
              <TouchableOpacity style={styles.missionButton}>
                <Text style={styles.missionButtonText}>Browse Decks</Text>
              </TouchableOpacity>
            </Link>
          </>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.dueCards}</Text>
          <Text style={styles.statLabel}>Due Now</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalCards}</Text>
          <Text style={styles.statLabel}>Total Cards</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalDecks}</Text>
          <Text style={styles.statLabel}>Decks</Text>
        </View>
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>"{motivationalMessage}"</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Link href="/decks" asChild>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>🗂️</Text>
            <Text style={styles.quickActionText}>Browse Decks</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/challenges" asChild>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>🏆</Text>
            <Text style={styles.quickActionText}>Challenges</Text>
          </TouchableOpacity>
        </Link>
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
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  streakContainer: {
    flex: 1,
    alignItems: 'center',
  },
  streakFlame: {
    fontSize: 48,
  },
  streakInfo: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  streakNumber: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  streakLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  personalBest: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  progressRingContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  missionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  missionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  missionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: fontSize.md * 1.4,
  },
  missionComplete: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  missionSubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  missionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  missionButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
});
