import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme';
import { getDatabase } from '../../src/db/database';
import type { Card } from '../../src/db/schema';

interface SearchResult extends Card {
  deck_name?: string;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const db = await getDatabase();
      const searchPattern = `%${searchQuery}%`;

      const cards = await db.getAllAsync<SearchResult>(
        `SELECT c.*, d.name as deck_name
         FROM cards c
         LEFT JOIN decks d ON c.deck_id = d.id
         WHERE c.front LIKE ? OR c.back LIKE ?
         ORDER BY c.front ASC
         LIMIT 50`,
        [searchPattern, searchPattern]
      );

      setResults(cards);
    } catch (err) {
      // Search failed - silently show empty results
    } finally {
      setSearching(false);
    }
  }, []);

  const onChangeText = (text: string) => {
    setQuery(text);

    // Clear previous timer to prevent memory leak
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounced search
    debounceTimerRef.current = setTimeout(() => handleSearch(text), 300);
  };

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={i} style={styles.highlight}>{part}</Text>
      ) : (
        <Text key={i}>{part}</Text>
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={onChangeText}
          placeholder="Search cards..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setQuery('');
              setResults([]);
            }}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      <ScrollView
        style={styles.results}
        contentContainerStyle={styles.resultsContent}
        keyboardShouldPersistTaps="handled"
      >
        {searching && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {query.length > 0 && results.length === 0 && !searching && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No cards found for "{query}"</Text>
          </View>
        )}

        {results.map((card) => (
          <View key={card.id} style={styles.resultCard}>
            <Text style={styles.resultQuestion}>
              {highlightMatch(card.front)}
            </Text>
            <Text style={styles.resultAnswer} numberOfLines={2}>
              {highlightMatch(card.back)}
            </Text>
            <View style={styles.resultMeta}>
              <Text style={styles.resultDeck}>{card.deck_name}</Text>
              <View style={[
                styles.stateBadge,
                card.state === 'new' && { backgroundColor: colors.cardNew },
                card.state === 'learning' && { backgroundColor: colors.cardLearning },
                card.state === 'review' && { backgroundColor: colors.cardReview },
                card.state === 'relearning' && { backgroundColor: colors.cardRelearning },
              ]}>
                <Text style={styles.stateText}>{card.state}</Text>
              </View>
            </View>
          </View>
        ))}

        {query.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyTitle}>Search Cards</Text>
            <Text style={styles.emptyText}>
              Type to search through all your flashcards by question or answer.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    paddingRight: spacing.xl,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.lg,
    padding: spacing.sm,
  },
  clearButtonText: {
    color: colors.textMuted,
    fontSize: 24,
    fontWeight: '300',
  },
  results: {
    flex: 1,
  },
  resultsContent: {
    padding: spacing.md,
  },
  resultCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  resultQuestion: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resultAnswer: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultDeck: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  stateBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  stateText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '500',
  },
  highlight: {
    backgroundColor: colors.warning + '40',
    color: colors.text,
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
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
  },
});
