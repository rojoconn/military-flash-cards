# Army Flashcards - Lessons Learned

## Patterns to Follow

### Expo Router
- Use file-based routing with (tabs) folder for tab navigation
- Dynamic routes use [param] syntax
- Place modal screens at root level with `presentation: 'modal'`

### Database
- expo-sqlite is simpler than WatermelonDB for POC
- Use async/await patterns consistently
- Generate UUIDs client-side for offline-first support
- Update card counts on deck after card operations

### FSRS Algorithm
- ts-fsrs package handles all scheduling complexity
- Map internal state names to FSRS State enum
- Store timestamps as numbers, convert to Date for FSRS
- Show scheduling preview before grading

## Mistakes to Avoid

### React Native
- Don't forget to wrap app in GestureHandlerRootView
- Always use SafeAreaView for fullscreen modals
- Test on both iOS and Android - behaviors differ

### Styling
- Avoid magic numbers - use theme spacing/colors
- Test dark mode visibility carefully
- Ensure sufficient contrast for field conditions

### React Native Screens (New Architecture)
- **CRITICAL:** Do NOT use `fontWeight` in `headerTitleStyle` or `tabBarLabelStyle`
- Causes: `TypeError: expected dynamic type 'boolean', but had type 'string'`
- This is a Fabric (new architecture) compatibility issue
- Workaround: Remove fontWeight from navigation style options

### Dependencies
- react-native-reanimated v4+ requires `react-native-worklets` as peer dependency
- Use `--legacy-peer-deps` flag for npm install with React 19
- Check peer dependencies before upgrading any RN packages
- **CRITICAL:** Use Expo-compatible versions, not latest:
  - `react-native-gesture-handler@~2.28.0` (not 2.30.0)
  - `react-native-reanimated@~4.1.1` (not 4.2.1)
  - `react-native-screens@~4.16.0` (not 4.23.0)
  - `react-native-worklets@0.5.1` (not 0.7.3)
- Run `npx expo install <package> --fix` or check expo docs for compatible versions

### ts-fsrs API
- Use `Rating` enum for display, `Grade` type for `fsrs.next()` method
- Cast with `as unknown as Grade` if needed
- FSRSCard type requires `learning_steps` property (set to 0 for new cards)

---

## Log

### 2026-02-10
- Initial project setup with Expo 54 + TypeScript
- Chose expo-sqlite over WatermelonDB for simpler POC
- FSRS integration via ts-fsrs package worked smoothly
- Created hierarchical category system (AR/FM/MOS/TC/ATP/STP)

### 2026-02-10 (continued)
- **BUG:** Missing `react-native-worklets` dependency for reanimated v4
  - Fix: `npm install react-native-worklets --legacy-peer-deps`
- **BUG:** "expected dynamic type 'boolean'" error from react-native-screens
  - Root cause: `fontWeight: '600'` in header/tab styles
  - Fix: Remove fontWeight from navigation screenOptions
- Updated CLAUDE.md with architecture decisions and future roadmap

### 2026-02-10 (Sprint 1-3 Implementation)
- **Sprint 1 Complete:**
  - Added card edit modal to deck/[id].tsx (tap card to edit, long-press to delete)
  - Fixed undo bug - now deletes review record from database
  - Added `deleteReview()` and `getLastReviewByCard()` to database.ts
  - Wrapped `bulkImportCards()` in transaction for atomic imports
- **Sprint 2 Partial:**
  - Added input validation with length limits (deck name: 100, card front: 1000, back: 2000)
  - Added character counters to all text inputs
  - Improved error messages with user-facing Alerts instead of console.error
- **Sprint 3 Partial:**
  - Fixed search memory leak - timer now properly cleaned up on unmount using useRef + useEffect
  - Added loading states/spinners to create deck and add/edit card operations
  - Disabled buttons while save operations are in progress

### Patterns Learned
- **Memory leak prevention:** Use `useRef` for timers, clean up in `useEffect` return
- **Input validation:** Add validation before setState, show Alert for user feedback
- **Loading states:** Use `saving` state to disable inputs/buttons during async operations
- **Atomic operations:** Wrap multi-row inserts in `withTransactionAsync()` for data integrity
- **Proper undo:** Store previous state BEFORE mutation, restore on undo (don't just delete logs)

### 2026-02-11 (Undo Bug Deep Fix)
- **BUG:** Original undo fix was incomplete - deleted review record but card FSRS state remained updated
- **Root cause:** `processReview()` updates both the card state AND creates review record
- **Fix:** Added `previousCardStates: Card[]` to session state
  - Before grading, push current card state to array
  - On undo, pop from array and call `updateCard()` to restore FSRS state
  - Also delete the review record and remove from undo history
- **Lesson:** When implementing undo, trace ALL side effects of the action being undone

### 2026-02-16 (App Store Preparation)
- **Trademark issue:** Renamed from "Army Flashcards" to "Military Flash Cards"
  - U.S. Army owns trademark rights - apps can be rejected
  - Generic terms like "Military" are safe
- **Production cleanup:** Removed all 17 console.error statements
  - User-facing errors: Use `Alert.alert()`
  - Internal errors: Silent catch with comment
- **iOS 17+ requirement:** Added `PrivacyInfo.xcprivacy` manifest
  - Declares API usage reasons (UserDefaults, FileTimestamp)
  - Configure via `app.json` → `ios.privacyManifests`
- **Legal protection:** Added disclaimer in Settings screen
- **Assets created:** App icon, splash screen, privacy policy, support page
- **EAS Build:** Configured `eas.json` for production builds

### App Store Checklist
- Remove all console.log/console.error before submission
- Create Privacy Manifest for iOS 17+ (`PrivacyInfo.xcprivacy`)
- Add legal disclaimer for government/military content
- Host Privacy Policy and Support URLs (GitHub Pages, Netlify, etc.)
- Replace placeholder icons/splash screens
- Avoid trademarked terms (Army, Navy, Marines) without affiliation
- U.S. Government publications are public domain (17 U.S.C. § 105)

### 2026-02-19 (Phase 1 Content Creation)
- **Content accuracy:** Always include source citations in answer text (visible during study)
- **Citation format:** Include publication number, chapter, and paragraph (e.g., "TC 7-21.13, Chapter 2, para 2-1")
- **Schema enhancement:** Added `source_para` field for paragraph-level citations
- **Content structure:** Group cards by publication/topic for logical deck organization
- **Verification:** Source citations enable users to verify accuracy against official publications

### Content Creation Best Practices
- Use consistent citation format: "(Source: [Pub], [Chapter], para [X])"
- Include source in both `source_para` field AND answer text for visibility
- Focus on factual, procedural content (less likely to become outdated)
- Avoid interpretation - use direct quotes/paraphrasing from source
- Group 30-50 cards per deck for manageable study sessions
- Test imports before pushing to production
