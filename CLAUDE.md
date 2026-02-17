# Military Flash Cards

Mobile-first flashcard application for military training, optimized for field use.

> **Note:** App renamed from "Army Flashcards" to avoid U.S. Army trademark issues.

## Tech Stack

- **Framework:** React Native + Expo 54
- **Navigation:** Expo Router (file-based)
- **Database:** expo-sqlite
- **Spaced Repetition:** FSRS algorithm via ts-fsrs
- **Language:** TypeScript

## Project Structure

```
army-flashcards/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation
│   ├── deck/[id].tsx       # Deck detail
│   ├── study/[deckId].tsx  # Study session
│   └── settings.tsx        # Settings
├── src/
│   ├── components/         # React components
│   ├── db/                 # Database schema & operations
│   ├── hooks/              # React hooks
│   ├── services/           # Business logic (FSRS, etc)
│   └── theme/              # Colors, spacing, typography
├── content/
│   ├── decks/              # JSON deck files
│   └── scripts/            # Content extraction scripts
└── tasks/                  # Todo and lessons
```

## Key Commands

```bash
# Development
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web

# Type checking
npx tsc --noEmit
```

## Database Schema

### Decks
- Categories: AR, FM, MOS, TC, ATP, STP
- Subcategories for specific topics (e.g., "13B", "M777A2")

### Cards
- Types: qa (question/answer), fillblank, image
- FSRS state: new, learning, review, relearning
- Tracks: due date, stability, difficulty, reps, lapses

### Reviews
- Audit trail of all reviews
- Grades: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)

## FSRS Algorithm

Using ts-fsrs with these settings:
- Request retention: 90% (military accuracy requirement)
- Maximum interval: 365 days
- Fuzz enabled for natural scheduling

## Content Sources

Primary content from m777-doc-pipeline documents:
- Field Manuals (FM 3-09, FM 6-40, FM 6-50)
- Training Circulars (TC 3-09.81, TC 7-22.7)
- Soldier Training Publications (STP 6-13B)
- ASPT Task Guides

## Development Notes

- Offline-first design for field conditions
- Dark theme optimized for low-light readability
- Minimal dependencies for reliability
- Cards persist across app restarts

---

## Known Issues & Workarounds

### React Native 0.81 + New Architecture (Fabric)
The app uses `newArchEnabled: true` in app.json. This can cause issues with:
- **react-native-screens:** Avoid `fontWeight` in `headerTitleStyle` and `tabBarLabelStyle` - causes "expected dynamic type 'boolean', but had type 'string'" error
- **react-native-reanimated:** Requires `react-native-worklets` peer dependency

### ts-fsrs API
- Use `Rating.Again/Hard/Good/Easy` for scheduling preview
- Use `Grade` type (not `Rating`) for `fsrs.next()` method
- FSRSCard requires `learning_steps: 0` property

### expo-sqlite
- Use `--legacy-peer-deps` when installing due to React 19 peer dep conflicts
- Database operations must be awaited before UI renders

---

## Architecture Decisions

### Why expo-sqlite over WatermelonDB
- Simpler setup for POC (no native module configuration)
- Built-in to Expo 54+
- Sufficient for single-user flashcard app
- Can migrate to WatermelonDB later if sync needed

### Why FSRS over SM-2
- 20-30% fewer daily reviews for same retention
- Open-source with active development
- Better adaptation to individual learning patterns

---

## Production Readiness Assessment

**Current State:** ~90% feature complete, ~85% production ready

### What Works Well
- Core study mechanics (FSRS integration solid)
- Tab navigation and routing
- Database persistence with transactions
- Dark theme optimized for field use
- Sample content import
- Card editing (tap to edit, long-press to delete)
- Proper undo (restores card FSRS state + deletes review)
- Input validation with character limits
- User-facing error alerts (no console.error in production)
- Loading states and disabled buttons during save
- iOS Privacy Manifest (iOS 17+ compliant)
- Legal disclaimer in Settings
- EAS Build configuration ready

### Remaining Before Store Submission
- Replace placeholder app icon (1024x1024)
- Replace placeholder splash screen
- Create Privacy Policy webpage
- Create Support URL/email
- Take screenshots for all device sizes
- Register developer accounts ($99 Apple, $25 Google)

### Nice-to-Have (Post-Launch)
- Deck import/export UI
- Performance optimization for large decks
- Haptic feedback and animations
- Content packs as IAP

---

---

## App Store Publication Guide

### Recommended Pricing
- **Price:** $4.99 (one-time purchase)
- **Net per sale:** ~$3.49 after 30% store cut
- **Break-even:** ~50 sales first year

### Required Assets
| Asset | Specs | Status |
|-------|-------|--------|
| App Icon | 1024x1024 PNG, no alpha | NEEDED |
| Splash Screen | 1284x2778 PNG | NEEDED |
| iPhone Screenshots | 6.7", 6.5", 5.5" | NEEDED |
| iPad Screenshots | 12.9" | NEEDED |
| Feature Graphic (Android) | 1024x500 | NEEDED |
| Privacy Policy URL | Hosted webpage | NEEDED |
| Support URL | Webpage or email | NEEDED |

### Build Commands
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Store Listing Copy

**App Name:** Military Flash Cards

**Subtitle (iOS):** Study Smarter with Spaced Repetition

**Short Description (Android):**
Master military training materials with scientifically-proven spaced repetition.

**Description:**
Study military training materials efficiently using the FSRS spaced repetition algorithm - the same science-backed method used by medical students and language learners worldwide.

Features:
- Offline-first design - works anywhere, no internet required
- FSRS algorithm schedules reviews at optimal intervals
- Dark mode optimized for low-light conditions
- Organize cards by category (FM, AR, MOS, TC, ATP, STP)
- Track your progress and mastery

Perfect for soldiers studying regulations, field manuals, and MOS-specific materials.

**Keywords (iOS):** flashcards, military, army, study, spaced repetition, training, education

**Category:** Education

**Age Rating:** 4+ (no objectionable content)

---

## Development Roadmap

### Sprint 1: Critical Bug Fixes - COMPLETE
- [x] Add card edit modal
- [x] Fix undo bug (restores full FSRS state)
- [x] Wrap bulk import in transaction
- [x] Add deleteReview() function

### Sprint 2: Input Validation - COMPLETE
- [x] Add input length limits
- [x] Replace console.error with Alerts
- [x] Add character counters

### Sprint 3: UX Polish - COMPLETE
- [x] Add loading spinners
- [x] Fix search memory leak
- [x] Disable buttons while saving

### Sprint 4: App Store Prep - COMPLETE
- [x] Rename app (trademark mitigation)
- [x] Add legal disclaimer
- [x] Create iOS Privacy Manifest
- [x] Set up EAS Build configuration
- [x] Remove all debug logging

### Sprint 5: Store Assets (NEXT)
- [ ] Design app icon
- [ ] Design splash screen
- [ ] Take screenshots
- [ ] Create Privacy Policy page
- [ ] Register developer accounts
- [ ] Submit to stores

**Content JSON Schema:**
```json
{
  "version": "1.0",
  "deck": {
    "name": "string",
    "description": "string",
    "category": "AR|FM|MOS|TC|ATP|STP",
    "subcategory": "string"
  },
  "cards": [
    {
      "front": "string",
      "back": "string",
      "type": "qa|fillblank|image",
      "source_doc": "string|null",
      "source_page": "number|null"
    }
  ]
}
```

### Sprint 5: Performance Optimization (Priority: MEDIUM)
**Goal:** Fast loading with large decks

| Task | File | Issue |
|------|------|-------|
| Batch deck stats query | `src/db/database.ts:229-271` | N+1 query (5 queries per deck) |
| Add pagination to search | `app/(tabs)/search.tsx` | Hardcoded LIMIT 50 |
| Lazy load cards in deck view | `app/deck/[id].tsx` | Loads all cards at once |
| Add database VACUUM on settings | `app/settings.tsx` | No cleanup strategy |

**Target Metrics:**
- Deck list load: <200ms for 50 decks
- Search results: <100ms
- Study session start: <150ms

### Sprint 6: Enhanced Settings (Priority: LOW)
**Goal:** User customization, data management

| Task | Description |
|------|-------------|
| Export all data to JSON | Backup entire database |
| Import from backup | Restore from JSON file |
| FSRS parameter tuning | Let users adjust retention target (85-95%) |
| Daily card limits | Set max new cards/day, max reviews/day |
| Study reminders | Local notifications (no server) |
| Reset progress per deck | Keep cards, reset FSRS state |

### Sprint 7: Accessibility & Polish (Priority: LOW)
**Goal:** Inclusive design, app store ready

| Task | Description |
|------|-------------|
| Replace emoji icons | Use proper icon library (Lucide/SF Symbols) |
| Add screenreader labels | accessibilityLabel on all interactive elements |
| Colorblind-safe indicators | Shape + color for card states |
| Dynamic font scaling | Respect system font size |
| App icon design | Military-themed icon |
| Splash screen | Branded loading screen |

### Future: Cloud Features (OUT OF SCOPE for v1)
These require backend infrastructure and are deferred:
- User authentication
- Cloud sync
- Shared decks
- Progress analytics API

---

## File Change Summary

| Sprint | Files Modified |
|--------|---------------|
| 1 | database.ts, useStudySession.ts, deck/[id].tsx |
| 2 | decks.tsx, deck/[id].tsx, study/[deckId].tsx, database.ts |
| 3 | FlashCard.tsx, decks.tsx, deck/[id].tsx, search.tsx |
| 4 | content-import.ts, _layout.tsx, settings.tsx, NEW: extract-cards.py |
| 5 | database.ts, search.tsx, deck/[id].tsx |
| 6 | settings.tsx, database.ts |
| 7 | FlashCard.tsx, all screens, app.json |

---

## Testing Strategy

### Unit Tests (Jest)
- `src/services/fsrs.ts` - Scheduling calculations
- `src/db/database.ts` - CRUD operations

### Integration Tests
- Study session flow (load cards → grade → verify state)
- Import/export roundtrip

### Manual Testing Checklist
- [ ] Create deck with max length inputs
- [ ] Study 10 cards, use undo, verify DB state
- [ ] Import large deck (500+ cards)
- [ ] Search with special characters
- [ ] Background/foreground app during study
- [ ] Kill app mid-study, verify data persists

---

## Related Projects

- **m777-doc-pipeline:** Source document processing (generates knowledge.sqlite)
- **M777Assistant:** Chat-based knowledge retrieval (can share themes, auth)
- **fitnessapp:** Reference for Supabase auth patterns
