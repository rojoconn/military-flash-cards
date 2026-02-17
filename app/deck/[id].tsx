import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect, Link } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme';
import {
  getDeckById,
  getDeckStats,
  getCardsByDeck,
  createCard,
  deleteCard,
  updateCard,
} from '../../src/db/database';
import { getNewCardDefaults } from '../../src/services/fsrs';
import type { Deck, Card } from '../../src/db/schema';

// Input validation limits
const CARD_FRONT_MAX = 1000;
const CARD_BACK_MAX = 2000;

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, learning: 0, review: 0, due: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [editCardFront, setEditCardFront] = useState('');
  const [editCardBack, setEditCardBack] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      const [deckData, deckStats, deckCards] = await Promise.all([
        getDeckById(id),
        getDeckStats(id),
        getCardsByDeck(id),
      ]);

      setDeck(deckData);
      setStats(deckStats);
      setCards(deckCards);
    } catch {
      // Load failed - shows loading state, user can pull to refresh
    }
  }, [id]);

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

  const handleAddCard = async () => {
    const front = newCardFront.trim();
    const back = newCardBack.trim();

    if (!id || !front || !back) {
      Alert.alert('Error', 'Please enter both question and answer');
      return;
    }

    if (front.length > CARD_FRONT_MAX) {
      Alert.alert('Error', `Question is too long (max ${CARD_FRONT_MAX} characters)`);
      return;
    }

    if (back.length > CARD_BACK_MAX) {
      Alert.alert('Error', `Answer is too long (max ${CARD_BACK_MAX} characters)`);
      return;
    }

    setSaving(true);
    try {
      const defaults = getNewCardDefaults();
      await createCard({
        deck_id: id,
        front,
        back,
        type: 'qa',
        source_doc: null,
        source_page: null,
        ...defaults,
      });

      setNewCardFront('');
      setNewCardBack('');
      setShowAddModal(false);
      await loadData();
    } catch {
      Alert.alert('Error', 'Failed to add card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = (card: Card) => {
    setEditingCard(card);
    setEditCardFront(card.front);
    setEditCardBack(card.back);
    setShowEditModal(true);
  };

  const handleEditCard = async () => {
    if (!editingCard) return;

    const front = editCardFront.trim();
    const back = editCardBack.trim();

    if (!front || !back) {
      Alert.alert('Error', 'Please enter both question and answer');
      return;
    }

    if (front.length > CARD_FRONT_MAX) {
      Alert.alert('Error', `Question is too long (max ${CARD_FRONT_MAX} characters)`);
      return;
    }

    if (back.length > CARD_BACK_MAX) {
      Alert.alert('Error', `Answer is too long (max ${CARD_BACK_MAX} characters)`);
      return;
    }

    setSaving(true);
    try {
      await updateCard(editingCard.id, { front, back });

      setEditingCard(null);
      setEditCardFront('');
      setEditCardBack('');
      setShowEditModal(false);
      await loadData();
    } catch {
      Alert.alert('Error', 'Failed to update card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = (card: Card) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(card.id, card.deck_id);
              await loadData();
            } catch {
              Alert.alert('Error', 'Failed to delete card. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!deck) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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
        {/* Deck Header */}
        <View style={styles.header}>
          <Text style={styles.deckName}>{deck.name}</Text>
          {deck.description && (
            <Text style={styles.deckDescription}>{deck.description}</Text>
          )}
          <View style={styles.deckMeta}>
            <Text style={styles.categoryBadge}>{deck.category}</Text>
            {deck.subcategory && (
              <Text style={styles.subcategory}>{deck.subcategory}</Text>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.due}</Text>
            <Text style={styles.statLabel}>Due</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.cardNew }]}>{stats.new}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.cardLearning }]}>{stats.learning}</Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.cardReview }]}>{stats.review}</Text>
            <Text style={styles.statLabel}>Review</Text>
          </View>
        </View>

        {/* Study Button */}
        {stats.due > 0 && (
          <Link href={`/study/${id}`} asChild>
            <TouchableOpacity style={styles.studyButton}>
              <Text style={styles.studyButtonText}>
                Study Now ({stats.due} due)
              </Text>
            </TouchableOpacity>
          </Link>
        )}

        {/* Cards List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cards ({cards.length})</Text>
          </View>

          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.cardItem}
              onPress={() => handleOpenEditModal(card)}
              onLongPress={() => handleDeleteCard(card)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardQuestion} numberOfLines={2}>
                  {card.front}
                </Text>
                <Text style={styles.cardAnswer} numberOfLines={1}>
                  {card.back}
                </Text>
              </View>
              <View style={[
                styles.cardState,
                card.state === 'new' && { backgroundColor: colors.cardNew },
                card.state === 'learning' && { backgroundColor: colors.cardLearning },
                card.state === 'review' && { backgroundColor: colors.cardReview },
                card.state === 'relearning' && { backgroundColor: colors.cardRelearning },
              ]}>
                <Text style={styles.cardStateText}>{card.state}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {cards.length === 0 && (
            <View style={styles.emptyCards}>
              <Text style={styles.emptyText}>
                No cards yet. Tap the + button to add your first card.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Card FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)} disabled={saving}>
              <Text style={[styles.modalCancel, saving && styles.textDisabled]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Card</Text>
            <TouchableOpacity onPress={handleAddCard} disabled={saving}>
              <Text style={[styles.modalSave, saving && styles.textDisabled]}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Question (Front)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={newCardFront}
              onChangeText={setNewCardFront}
              placeholder="Enter the question..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={CARD_FRONT_MAX}
              editable={!saving}
            />
            <Text style={styles.charCount}>
              {newCardFront.length}/{CARD_FRONT_MAX}
            </Text>

            <Text style={styles.inputLabel}>Answer (Back)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={newCardBack}
              onChangeText={setNewCardBack}
              placeholder="Enter the answer..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={CARD_BACK_MAX}
              editable={!saving}
            />
            <Text style={styles.charCount}>
              {newCardBack.length}/{CARD_BACK_MAX}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Card Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)} disabled={saving}>
              <Text style={[styles.modalCancel, saving && styles.textDisabled]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Card</Text>
            <TouchableOpacity onPress={handleEditCard} disabled={saving}>
              <Text style={[styles.modalSave, saving && styles.textDisabled]}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Question (Front)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={editCardFront}
              onChangeText={setEditCardFront}
              placeholder="Enter the question..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={CARD_FRONT_MAX}
              editable={!saving}
            />
            <Text style={styles.charCount}>
              {editCardFront.length}/{CARD_FRONT_MAX}
            </Text>

            <Text style={styles.inputLabel}>Answer (Back)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={editCardBack}
              onChangeText={setEditCardBack}
              placeholder="Enter the answer..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={CARD_BACK_MAX}
              editable={!saving}
            />
            <Text style={styles.charCount}>
              {editCardBack.length}/{CARD_BACK_MAX}
            </Text>

            {editingCard && (
              <View style={styles.cardMeta}>
                <Text style={styles.cardMetaText}>
                  State: {editingCard.state} | Reps: {editingCard.reps} | Lapses: {editingCard.lapses}
                </Text>
              </View>
            )}
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
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  deckName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  deckDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  deckMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  subcategory: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statsContainer: {
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
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  cardItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardQuestion: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardAnswer: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  cardState: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  cardStateText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '500',
  },
  emptyCards: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
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
  modalSave: {
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
    minHeight: 100,
    textAlignVertical: 'top',
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
  cardMeta: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardMetaText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
