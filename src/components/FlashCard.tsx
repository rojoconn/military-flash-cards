import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import type { Card } from '../db/schema';

interface FlashCardProps {
  card: Card;
  showAnswer: boolean;
  onFlip: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;

export function FlashCard({ card, showAnswer, onFlip }: FlashCardProps) {
  const getStateColor = () => {
    switch (card.state) {
      case 'new': return colors.cardNew;
      case 'learning': return colors.cardLearning;
      case 'review': return colors.cardReview;
      case 'relearning': return colors.cardRelearning;
      default: return colors.textMuted;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onFlip}
      style={styles.container}
    >
      <View style={[styles.card, { borderLeftColor: getStateColor() }]}>
        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={styles.label}>Q</Text>
          <Text style={styles.questionText}>{card.front}</Text>
        </View>

        {/* Answer (revealed on flip) */}
        {showAnswer && (
          <View style={styles.answerSection}>
            <View style={styles.divider} />
            <Text style={styles.label}>A</Text>
            <Text style={styles.answerText}>{card.back}</Text>
          </View>
        )}

        {/* Tap to reveal hint */}
        {!showAnswer && (
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to reveal answer</Text>
          </View>
        )}

        {/* Source info */}
        {card.source_doc && (
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceText} numberOfLines={1}>
              📄 {card.source_doc}
              {card.source_page ? ` (p. ${card.source_page})` : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface GradeButtonsProps {
  options: Array<{
    grade: 1 | 2 | 3 | 4;
    label: string;
    interval: string;
  }>;
  onGrade: (grade: 1 | 2 | 3 | 4) => void;
  disabled?: boolean;
}

export function GradeButtons({ options, onGrade, disabled }: GradeButtonsProps) {
  // Find the intervals for display
  const againOption = options.find(o => o.grade === 1);
  const goodOption = options.find(o => o.grade === 3);

  return (
    <View style={styles.gradeContainer}>
      {/* Add to Back of Deck (Again) */}
      <TouchableOpacity
        style={[
          styles.gradeButton,
          styles.gradeButtonAgain,
          disabled && styles.gradeButtonDisabled,
        ]}
        onPress={() => onGrade(1)}
        disabled={disabled}
      >
        <Text style={styles.gradeLabel}>Back of Deck</Text>
        {againOption && (
          <Text style={styles.gradeInterval}>{againOption.interval}</Text>
        )}
      </TouchableOpacity>

      {/* Good to Go (Good) */}
      <TouchableOpacity
        style={[
          styles.gradeButton,
          styles.gradeButtonGood,
          disabled && styles.gradeButtonDisabled,
        ]}
        onPress={() => onGrade(3)}
        disabled={disabled}
      >
        <Text style={styles.gradeLabel}>Good to Go</Text>
        {goodOption && (
          <Text style={styles.gradeInterval}>{goodOption.interval}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    minHeight: 300,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    minHeight: 280,
  },
  questionSection: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  questionText: {
    fontSize: fontSize.xl,
    color: colors.text,
    lineHeight: fontSize.xl * 1.4,
  },
  answerSection: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  answerText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    lineHeight: fontSize.lg * 1.5,
  },
  tapHint: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  tapHintText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  sourceInfo: {
    marginTop: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourceText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  gradeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  gradeButtonAgain: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  gradeButtonGood: {
    backgroundColor: colors.primary,
  },
  gradeButtonDisabled: {
    opacity: 0.5,
  },
  gradeLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  gradeInterval: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
});
