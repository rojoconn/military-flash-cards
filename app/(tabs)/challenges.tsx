import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, Link } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme';
import {
  getUserProgress,
  getAchievements,
  getGlobalStats,
  getTodayReviewCount,
} from '../../src/db/database';
import type { Achievement, UserProgress } from '../../src/db/schema';

export default function ChallengesScreen() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({ dueCards: 0, reviewedToday: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [userProgress, allAchievements, globalStats] = await Promise.all([
        getUserProgress(),
        getAchievements(),
        getGlobalStats(),
      ]);
      setProgress(userProgress);
      setAchievements(allAchievements);
      setStats({
        dueCards: globalStats.dueCards,
        reviewedToday: globalStats.reviewedToday,
      });
    } catch {
      // Load failed
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

  const unlockedAchievements = achievements.filter((a) => a.unlocked_at);
  const lockedAchievements = achievements.filter((a) => !a.unlocked_at);

  const dailyGoal = progress?.daily_goal ?? 20;
  const dailyProgress = Math.min((stats.reviewedToday / dailyGoal) * 100, 100);

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
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>{progress?.current_streak ?? 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>{progress?.longest_streak ?? 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📚</Text>
          <Text style={styles.statValue}>{progress?.total_cards_reviewed ?? 0}</Text>
          <Text style={styles.statLabel}>Cards Reviewed</Text>
        </View>
      </View>

      {/* Daily Challenge */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Challenge</Text>
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeIcon}>🎯</Text>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeName}>Daily Goal</Text>
              <Text style={styles.challengeDesc}>
                Review {dailyGoal} cards today
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${dailyProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {stats.reviewedToday} / {dailyGoal}
            </Text>
          </View>
          {dailyProgress >= 100 ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Completed!</Text>
            </View>
          ) : stats.dueCards > 0 ? (
            <Link href="/study/all" asChild>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>Continue Training</Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <Text style={styles.noCardsText}>No cards due - check back later!</Text>
          )}
        </View>
      </View>

      {/* Quick Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Challenges</Text>
        <View style={styles.challengeGrid}>
          <TouchableOpacity style={styles.quickChallenge}>
            <Text style={styles.quickChallengeIcon}>⚡</Text>
            <Text style={styles.quickChallengeName}>Speed Run</Text>
            <Text style={styles.quickChallengeDesc}>20 cards in 2 min</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChallenge}>
            <Text style={styles.quickChallengeIcon}>✨</Text>
            <Text style={styles.quickChallengeName}>Perfect 10</Text>
            <Text style={styles.quickChallengeDesc}>10 without mistakes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChallenge}>
            <Text style={styles.quickChallengeIcon}>🎲</Text>
            <Text style={styles.quickChallengeName}>Random Mix</Text>
            <Text style={styles.quickChallengeDesc}>Cards from all decks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChallenge}>
            <Text style={styles.quickChallengeIcon}>💪</Text>
            <Text style={styles.quickChallengeName}>Tough Cards</Text>
            <Text style={styles.quickChallengeDesc}>Review hardest cards</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Achievements ({unlockedAchievements.length}/{achievements.length})
        </Text>

        {/* Unlocked */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.achievementGroup}>
            <Text style={styles.achievementGroupTitle}>Unlocked</Text>
            {unlockedAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                </View>
                <Text style={styles.achievementCheck}>✓</Text>
              </View>
            ))}
          </View>
        )}

        {/* Locked */}
        {lockedAchievements.length > 0 && (
          <View style={styles.achievementGroup}>
            <Text style={styles.achievementGroupTitle}>Locked</Text>
            {lockedAchievements.map((achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, styles.achievementLocked]}>
                <Text style={[styles.achievementIcon, styles.achievementIconLocked]}>
                  {achievement.icon}
                </Text>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementName, styles.achievementNameLocked]}>
                    {achievement.name}
                  </Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                </View>
                <Text style={styles.achievementLock}>🔒</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Motivational Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          "The only easy day was yesterday."
        </Text>
        <Text style={styles.footerSubtext}>Keep pushing, Soldier!</Text>
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
  statsSection: {
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
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
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
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  challengeDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  completedBadge: {
    backgroundColor: colors.gradeGood,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  completedText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  noCardsText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  challengeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickChallenge: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  quickChallengeIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  quickChallengeName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  quickChallengeDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  achievementGroup: {
    marginBottom: spacing.md,
  },
  achievementGroupTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  achievementIconLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  achievementNameLocked: {
    color: colors.textSecondary,
  },
  achievementDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  achievementCheck: {
    fontSize: 20,
    color: colors.gradeGood,
  },
  achievementLock: {
    fontSize: 16,
    opacity: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
