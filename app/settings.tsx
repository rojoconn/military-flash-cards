import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../src/theme';
import { getDatabase } from '../src/db/database';

export default function SettingsScreen() {
  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will delete ALL decks and cards. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();
              await db.execAsync('DELETE FROM reviews;');
              await db.execAsync('DELETE FROM cards;');
              await db.execAsync('DELETE FROM decks;');
              Alert.alert('Success', 'Database has been reset.');
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to reset database. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Version</Text>
          <Text style={styles.itemValue}>1.0.0</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Algorithm</Text>
          <Text style={styles.itemValue}>FSRS v4</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.dangerItem} onPress={handleResetDatabase}>
          <Text style={styles.dangerText}>Reset Database</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credits</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Military Flash Cards</Text>
          <Text style={styles.creditsText}>
            Study smarter with spaced repetition.
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Spaced Repetition</Text>
          <Text style={styles.creditsText}>
            Powered by FSRS (Free Spaced Repetition Scheduler)
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.item}>
          <Text style={styles.disclaimerText}>
            This app is not affiliated with, endorsed by, or sponsored by the U.S. Army, Department of Defense, or any government agency. Content is derived from public domain U.S. Government publications.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  item: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  itemLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  creditsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: fontSize.sm * 1.4,
  },
  dangerItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerText: {
    fontSize: fontSize.md,
    color: colors.error,
    fontWeight: '500',
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: fontSize.sm * 1.5,
  },
});
