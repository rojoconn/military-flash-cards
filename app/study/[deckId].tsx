import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme';
import { FlashCard, GradeButtons } from '../../src/components/FlashCard';
import { useStudySession } from '../../src/hooks/useStudySession';

export default function StudyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const insets = useSafeAreaInsets();

  const {
    currentCard,
    showAnswer,
    schedulingOptions,
    isLoading,
    isComplete,
    stats,
    totalCards,
    currentIndex,
    progress,
    flipCard,
    gradeCard,
    undoLastGrade,
    reload,
  } = useStudySession(deckId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading cards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    const accuracy = stats.reviewed > 0
      ? Math.round(((stats.good + stats.easy) / stats.reviewed) * 100)
      : 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeIcon}>🎉</Text>
          <Text style={styles.completeTitle}>Session Complete!</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.reviewed}</Text>
              <Text style={styles.statLabel}>Reviewed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>

          <View style={styles.gradeBreakdown}>
            <View style={[styles.gradeStat, { borderLeftColor: colors.gradeAgain }]}>
              <Text style={styles.gradeStatValue}>{stats.again}</Text>
              <Text style={styles.gradeStatLabel}>Again</Text>
            </View>
            <View style={[styles.gradeStat, { borderLeftColor: colors.gradeHard }]}>
              <Text style={styles.gradeStatValue}>{stats.hard}</Text>
              <Text style={styles.gradeStatLabel}>Hard</Text>
            </View>
            <View style={[styles.gradeStat, { borderLeftColor: colors.gradeGood }]}>
              <Text style={styles.gradeStatValue}>{stats.good}</Text>
              <Text style={styles.gradeStatLabel}>Good</Text>
            </View>
            <View style={[styles.gradeStat, { borderLeftColor: colors.gradeEasy }]}>
              <Text style={styles.gradeStatValue}>{stats.easy}</Text>
              <Text style={styles.gradeStatLabel}>Easy</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.studyMoreButton} onPress={reload}>
            <Text style={styles.studyMoreButtonText}>Study More</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyTitle}>No Cards Due</Text>
          <Text style={styles.emptyText}>
            All caught up! Check back later for more reviews.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + spacing.sm, spacing.lg) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {totalCards}
          </Text>
        </View>

        <TouchableOpacity
          onPress={undoLastGrade}
          style={[styles.undoButton, currentIndex === 0 && styles.undoButtonDisabled]}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.undoButtonText, currentIndex === 0 && styles.undoButtonTextDisabled]}>
            ↩
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <FlashCard
          card={currentCard}
          showAnswer={showAnswer}
          onFlip={flipCard}
        />
      </View>

      {/* Grade Buttons */}
      <View style={[styles.gradeSection, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        {showAnswer ? (
          <GradeButtons
            options={schedulingOptions}
            onGrade={gradeCard}
          />
        ) : (
          <TouchableOpacity style={styles.showAnswerButton} onPress={flipCard}>
            <Text style={styles.showAnswerButtonText}>Show Answer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 22,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '500',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  undoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoButtonDisabled: {
    opacity: 0.3,
  },
  undoButtonText: {
    color: colors.textSecondary,
    fontSize: 20,
  },
  undoButtonTextDisabled: {
    color: colors.textMuted,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  gradeSection: {
    paddingTop: spacing.lg,
  },
  showAnswerButton: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  showAnswerButtonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  // Complete screen styles
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  completeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  statValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  gradeBreakdown: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  gradeStat: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
  },
  gradeStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  gradeStatLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  doneButtonText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  studyMoreButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  studyMoreButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  // Empty screen styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
