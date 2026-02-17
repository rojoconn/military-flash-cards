# Army Flashcards - Development Todo

## Current Sprint: Sprint 4 - Content Pipeline

### In Progress
- [ ] Move sample decks from TypeScript to JSON files
- [ ] Auto-import samples on first launch (if DB empty)
- [ ] Add "Import Deck" button with file picker
- [ ] Add "Export Deck" button to share decks
- [ ] Create Python script to extract cards from m777-doc-pipeline

### Pending (Sprint 5+)
- [ ] Batch deck stats into single aggregate query
- [ ] Add pagination to search results
- [ ] Lazy load cards in deck view (virtualized list)
- [ ] Add database VACUUM option in settings
- [ ] Add haptic feedback on grade buttons
- [ ] Add card flip animation

---

## Sprint 2: Input Validation & Error Handling
- [x] Add input length limits (deck name: 100, card front: 1000, back: 2000)
- [ ] Validate deck exists before loading study session
- [x] Replace console.error with user-facing Alert messages
- [ ] Add try-catch to all database operations
- [ ] Validate JSON schema in content imports

## Sprint 3: UX Polish
- [x] Add loading spinner to create deck operation
- [x] Add loading spinner to add/edit card operations
- [x] Fix search memory leak (clear debounce timer on unmount)
- [ ] Add haptic feedback on grade buttons
- [ ] Add card flip animation
- [x] Disable buttons while save operations are in progress

## Sprint 4: Content Pipeline
- [ ] Move sample decks from TypeScript to JSON files
- [ ] Auto-import samples on first launch (if DB empty)
- [ ] Add "Import Deck" button with file picker
- [ ] Add "Export Deck" button to share decks
- [ ] Create Python script to extract cards from m777-doc-pipeline

## Sprint 5: Performance Optimization
- [ ] Batch deck stats into single aggregate query
- [ ] Add pagination to search results
- [ ] Lazy load cards in deck view (virtualized list)
- [ ] Add database VACUUM option in settings

## Sprint 6: Enhanced Settings
- [ ] Export all data to JSON backup
- [ ] Import from JSON backup
- [ ] FSRS retention target slider (85-95%)
- [ ] Daily new card limit setting
- [ ] Daily review limit setting
- [ ] Reset progress per deck option

## Sprint 7: Accessibility & Polish
- [ ] Replace emoji icons with proper icon library
- [ ] Add accessibilityLabel to all interactive elements
- [ ] Colorblind-safe card state indicators
- [ ] Dynamic font scaling support
- [ ] Design app icon
- [ ] Create splash screen

---

## Completed

### Sprint 1: Critical Bug Fixes (2026-02-10)
- [x] Add card edit modal to deck detail page
- [x] Fix undo bug - delete review record from database on undo
- [x] Wrap bulkImportCards() in database transaction
- [x] Add deleteReview() and getLastReviewByCard() functions to database.ts

### Initial Setup (2026-02-10)
- [x] Create Expo project with TypeScript template
- [x] Set up Expo Router file-based navigation
- [x] Implement database schema (Deck, Card, Review)
- [x] Implement FSRS scheduler service
- [x] Create FlashCard component with grade buttons
- [x] Build tab navigation (Study, Decks, Progress, Search)
- [x] Build study session with spaced repetition
- [x] Create deck browser with categories
- [x] Create sample M777 and ASPT content
- [x] Fix react-native-screens Fabric compatibility
- [x] Fix dependency version compatibility

---

## Known Bugs

| Bug | Location | Status |
|-----|----------|--------|
| Review not deleted on undo | useStudySession.ts | Fixed |
| Search timer memory leak | search.tsx | Fixed |
| No card edit capability | deck/[id].tsx | Fixed |
| Silent database errors | Multiple files | Partial (alerts added to UI operations) |

---

## Notes

- All features must work offline (no backend dependencies for v1)
- Target 90% retention rate for military accuracy
- Dark theme required for field use
- Test on both iOS and Android before release
