# Code Review Findings and Fix Plan

## High-priority bugs

1. **Undo is blocked for single-card sessions and first-card reviews**
   - `undoLastGrade()` exits early when `currentIndex <= 0`, even if there is valid undo history.
   - The study screen also disables the undo button whenever `currentIndex === 0`.
   - **Impact:** Users cannot undo the first graded card in a session (including single-card sessions).
   - **Fix direction:** Gate undo by `previousCardStates.length > 0` instead of index; when undoing from completion state, restore card from saved state and compute a safe target index.

2. **Undo only partially restores session stats**
   - Undo decrements `reviewed` but does not decrement the specific grade bucket (`again/hard/good/easy`).
   - **Impact:** Session summary becomes inaccurate after undo.
   - **Fix direction:** Persist last grade in undo history (e.g., `{ card, grade }`) and roll back both `reviewed` and the matching grade counter.

3. **Undo does not roll back user_progress**
   - Grading calls `updateUserProgress(1)` but undo only deletes review + restores card FSRS state.
   - **Impact:** Daily reviewed count and lifetime reviewed totals drift upward when user uses undo.
   - **Fix direction:** Add a compensating DB operation for undo (e.g., `updateUserProgress(-1)` with guard rails) and ensure streak/day logic is not corrupted when reversing within the same day.

4. **Search highlighting can crash on regex special characters**
   - Highlighting uses `new RegExp(query, 'gi')` without escaping regex metacharacters.
   - **Impact:** Queries like `(`, `[`, `*`, `\` can throw and break rendering.
   - **Fix direction:** Escape regex input before constructing `RegExp`, or avoid regex split and do case-insensitive index matching.

## Medium-priority issues

5. **Progress screen does N+1 stats queries**
   - Progress loads all decks, then calls `getDeckStats` per deck.
   - **Impact:** Slow load as deck count grows.
   - **Fix direction:** Add a batched aggregate query (GROUP BY deck_id) and merge in JS.

6. **Study progress bar starts at 0% on first card**
   - Progress is computed as `currentIndex / totalCards`; first card shows 0% even though session has started.
   - **Impact:** Feels off-by-one in UX.
   - **Fix direction:** Consider `(currentIndex + 1) / totalCards` for “position progress,” or keep current formula but relabel as “completed.”

## Proposed implementation sequence for Claude

1. **Refactor undo state model**
   - Replace `previousCardStates: Card[]` with `undoStack: Array<{ card: Card; grade: 1|2|3|4 }>`.
   - Update grade flow to push both card snapshot and selected grade.

2. **Fix undo eligibility and navigation behavior**
   - Allow undo whenever `undoStack.length > 0`.
   - Update button disabled state in `app/study/[deckId].tsx` to follow undoStack availability.
   - Handle undo from completed sessions and single-card sessions.

3. **Implement full undo compensation**
   - On undo: delete latest review for the undone card, restore FSRS fields, decrement `reviewed`, decrement grade bucket.
   - Add DB support to compensate user progress safely (minimum 0 floor).

4. **Harden search highlighting**
   - Add `escapeRegExp` helper and use it in `highlightMatch`.
   - Add test cases/manual checks for `(`, `[abc]`, `*`, `.` and mixed-case words.

5. **Performance pass for progress screen**
   - Add batched deck stats query in DB layer.
   - Replace per-deck `getDeckStats()` loop with one query result mapping.

6. **Validation checklist**
   - Single-card deck: grade once, undo works.
   - Multi-card deck: grade 2 cards, undo twice, stats/grade buckets/progress all match expected values.
   - Verify `reviewedToday` and total reviewed do not inflate with grade+undo cycles.
   - Search for regex special chars does not crash UI.

