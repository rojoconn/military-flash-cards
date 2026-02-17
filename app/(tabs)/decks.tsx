import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme';
import {
  getAllDecks,
  createDeck,
  getDeckStats,
  deleteDeck,
} from '../../src/db/database';
import { importSampleDecks } from '../../src/services/content-import';
import type { Deck } from '../../src/db/schema';

// Input validation limits
const DECK_NAME_MAX = 100;
const DECK_SUBCATEGORY_MAX = 50;

const CATEGORIES = [
  { value: 'MOS', label: 'MOS Training', icon: '🎖️' },
  { value: 'FM', label: 'Field Manuals', icon: '📖' },
  { value: 'AR', label: 'Army Regulations', icon: '📋' },
  { value: 'TC', label: 'Training Circulars', icon: '📝' },
  { value: 'ATP', label: 'Army Techniques', icon: '⚙️' },
  { value: 'STP', label: 'Soldier Training', icon: '🪖' },
] as const;

interface DeckWithStats extends Deck {
  stats?: {
    total: number;
    new: number;
    learning: number;
    review: number;
    due: number;
  };
}

export default function DecksScreen() {
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckCategory, setNewDeckCategory] = useState<Deck['category']>('MOS');
  const [newDeckSubcategory, setNewDeckSubcategory] = useState('');

  const loadDecks = useCallback(async () => {
    try {
      const allDecks = await getAllDecks();
      const decksWithStats = await Promise.all(
        allDecks.map(async (deck) => ({
          ...deck,
          stats: await getDeckStats(deck.id),
        }))
      );
      setDecks(decksWithStats);
    } catch {
      // Load failed - shows empty state, user can pull to refresh
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDecks();
    }, [loadDecks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDecks();
    setRefreshing(false);
  };

  const handleCreateDeck = async () => {
    const name = newDeckName.trim();
    const subcategory = newDeckSubcategory.trim();

    if (!name) {
      Alert.alert('Error', 'Please enter a deck name');
      return;
    }

    if (name.length > DECK_NAME_MAX) {
      Alert.alert('Error', `Deck name is too long (max ${DECK_NAME_MAX} characters)`);
      return;
    }

    if (subcategory.length > DECK_SUBCATEGORY_MAX) {
      Alert.alert('Error', `Subcategory is too long (max ${DECK_SUBCATEGORY_MAX} characters)`);
      return;
    }

    setSaving(true);
    try {
      await createDeck({
        name,
        description: newDeckDescription.trim(),
        category: newDeckCategory,
        subcategory,
      });

      setNewDeckName('');
      setNewDeckDescription('');
      setNewDeckSubcategory('');
      setShowCreateModal(false);
      await loadDecks();
    } catch {
      Alert.alert('Error', 'Failed to create deck. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDeck = (deck: Deck) => {
    Alert.alert(
      'Delete Deck',
      `Are you sure you want to delete "${deck.name}"? This will also delete all cards in this deck.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeck(deck.id);
              await loadDecks();
            } catch {
              Alert.alert('Error', 'Failed to delete deck. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  const groupedDecks = CATEGORIES.map(category => ({
    ...category,
    decks: decks.filter(d => d.category === category.value),
  })).filter(group => group.decks.length > 0);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {groupedDecks.map((group) => (
          <View key={group.value} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{group.icon}</Text>
              <Text style={styles.categoryTitle}>{group.label}</Text>
            </View>

            {group.decks.map((deck) => (
              <Link key={deck.id} href={`/deck/${deck.id}`} asChild>
                <TouchableOpacity
                  style={styles.deckCard}
                  onLongPress={() => handleDeleteDeck(deck)}
                >
                  <View style={styles.deckInfo}>
                    <Text style={styles.deckName}>{deck.name}</Text>
                    {deck.description && (
                      <Text style={styles.deckDescription} numberOfLines={1}>
                        {deck.description}
                      </Text>
                    )}
                    {deck.subcategory && (
                      <Text style={styles.deckSubcategory}>
                        {deck.subcategory}
                      </Text>
                    )}
                  </View>
                  <View style={styles.deckStats}>
                    {deck.stats && deck.stats.due > 0 && (
                      <View style={styles.dueBadge}>
                        <Text style={styles.dueBadgeText}>
                          {deck.stats.due}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.cardCount}>
                      {deck.card_count} cards
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        ))}

        {decks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No Decks Yet</Text>
            <Text style={styles.emptyText}>
              Create your first deck or import sample content to start studying.
            </Text>
            <TouchableOpacity
              style={styles.importButton}
              onPress={async () => {
                try {
                  const result = await importSampleDecks();
                  Alert.alert(
                    'Import Complete',
                    `Imported ${result.imported} deck(s). ${result.skipped} already existed.`
                  );
                  await loadDecks();
                } catch {
                  Alert.alert('Error', 'Failed to import sample decks. Please try again.');
                }
              }}
            >
              <Text style={styles.importButtonText}>Import Sample Decks</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Deck Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Deck Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)} disabled={saving}>
              <Text style={[styles.modalCancel, saving && styles.textDisabled]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Deck</Text>
            <TouchableOpacity onPress={handleCreateDeck} disabled={saving}>
              <Text style={[styles.modalCreate, saving && styles.textDisabled]}>
                {saving ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={newDeckName}
              onChangeText={setNewDeckName}
              placeholder="e.g., M777A2 Pre-Fire Checks"
              placeholderTextColor={colors.textMuted}
              maxLength={DECK_NAME_MAX}
              editable={!saving}
            />
            <Text style={styles.charCount}>{newDeckName.length}/{DECK_NAME_MAX}</Text>

            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={newDeckDescription}
              onChangeText={setNewDeckDescription}
              placeholder="What is this deck about?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              editable={!saving}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryPicker}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    newDeckCategory === cat.value && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setNewDeckCategory(cat.value as Deck['category'])}
                  disabled={saving}
                >
                  <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryOptionText,
                      newDeckCategory === cat.value && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Subcategory (optional)</Text>
            <TextInput
              style={styles.input}
              value={newDeckSubcategory}
              onChangeText={setNewDeckSubcategory}
              placeholder="e.g., 13B, Manual Gunnery"
              placeholderTextColor={colors.textMuted}
              maxLength={DECK_SUBCATEGORY_MAX}
              editable={!saving}
            />
            <Text style={styles.charCount}>{newDeckSubcategory.length}/{DECK_SUBCATEGORY_MAX}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  categoryTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  deckCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  deckDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  deckSubcategory: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  deckStats: {
    alignItems: 'flex-end',
  },
  dueBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  dueBadgeText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  cardCount: {
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
    marginBottom: spacing.lg,
  },
  importButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  importButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  modalCreate: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  modalContent: {
    padding: spacing.md,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  categoryOptionIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryOptionText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  categoryOptionTextSelected: {
    color: colors.text,
    fontWeight: '500',
  },
  charCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  textDisabled: {
    opacity: 0.5,
  },
});
