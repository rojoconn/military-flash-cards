# Phase 2 Content Plan - Military Flash Cards

## Phase 1 Review: Flashcard Effectiveness Analysis

### Issues Identified

#### 1. Cards That Are TOO LONG (must fix)

| Card | Problem | Fix |
|------|---------|-----|
| **NCO Creed** | ~250 words - impossible to memorize as single card | Replace with 3 focused cards on key concepts |
| **Soldier's Creed** | ~120 words | Keep - soldiers memorize verbatim, but mark as "recitation" |
| **MEDEVAC 9-line** | All 9 lines - too much for recall | Break into Line 1-3, 4-6, 7-9 cards |

#### 2. Cards with Too Many List Items (borderline)

| Card | Items | Recommendation |
|------|-------|----------------|
| When do you salute? | 6 items | Simplify to top 4 situations |
| When do you NOT salute? | 7 items | Summarize: "Indoors, impractical, civilian attire" |
| Signs of tension pneumothorax | 6 symptoms | OK - medical checklist format expected |
| Signs of shock | 8 symptoms | Borderline - keep as reference |

#### 3. Cards That Are GOOD (model for Phase 2)

**Ideal format - single fact, <30 words:**
```
Q: What is a 'rank' in military drill?
A: A line of Soldiers placed side by side.
(Source: TC 7-21.13, Ch 4, para 4-3)
```

```
Q: How many steps per minute is quick time?
A: 120 steps per minute.
(Source: TC 7-21.13, Ch 4, para 4-9)
```

```
Q: What is the maximum effective range of the M4?
A: Point target: 500m. Area target: 600m.
(Source: STP 21-1-SMCT, Task 071-311-2025)
```

---

## Flashcard Design Principles for Phase 2

### The Minimum Information Principle

1. **One fact per card** - Never combine unrelated facts
2. **Answer in <15 seconds** - If it takes longer, card is too complex
3. **Maximum 5 list items** - Break longer lists into multiple cards
4. **No walls of text** - Answers should be scannable

### Card Types

| Type | Example Question | Example Answer |
|------|------------------|----------------|
| **Definition** | "What is METT-TC?" | "Mission, Enemy, Terrain, Troops, Time, Civilians - factors for tactical planning" |
| **Specification** | "What is the M4 cyclic rate of fire?" | "700-970 rounds per minute" |
| **Acronym** | "What does SPORTS stand for?" | "Slap, Pull, Observe, Release, Tap, Squeeze" |
| **Procedure** | "What is Step 1 of clearing the M4?" | "Point muzzle in safe direction" |
| **Recognition** | "Identify this terrain feature: contours forming closed circles" | "Hill" |

### Answer Length Guidelines

- **Definitions:** 10-25 words
- **Specifications:** 5-15 words
- **Acronyms:** Just the expanded form
- **Procedures:** One step per card OR abbreviated checklist (≤5 items)
- **Creeds/Recitations:** Mark as "recitation practice" - keep full text

---

## Phase 1 Fixes Required

### Replace NCO Creed Card

**DELETE this card:**
```
Q: What is the NCO Creed?
A: [250+ word creed]
```

**REPLACE with 3 cards:**

```json
{
  "front": "What is the NCO watchword?",
  "back": "Competence.\n\n(Source: TC 7-21.13, Ch 2, para 2-12)"
},
{
  "front": "What are the two basic responsibilities of an NCO?",
  "back": "1. Accomplishment of the mission\n2. Welfare of Soldiers\n\n(Source: TC 7-21.13, Ch 2, para 2-12)"
},
{
  "front": "What corps is the NCO a member of, according to the NCO Creed?",
  "back": "The Backbone of the Army.\n\n(Source: TC 7-21.13, Ch 2, para 2-12)"
}
```

### Simplify Salute Cards

**BEFORE:**
```
Q: When do you salute?
A: [6 bullet points...]
```

**AFTER:**
```json
{
  "front": "When do you salute outdoors?",
  "back": "When you meet or pass a commissioned/warrant officer.\n\n(Source: TC 7-21.13, Ch 3, para 3-2)"
},
{
  "front": "When do you salute during ceremonies?",
  "back": "During the National Anthem, \"To the Color,\" or when colors pass uncased.\n\n(Source: TC 7-21.13, Ch 3, para 3-5)"
}
```

### Split MEDEVAC 9-Line

**BEFORE:** One card with all 9 lines

**AFTER:**
```json
{
  "front": "MEDEVAC 9-line: What are Lines 1-3?",
  "back": "Line 1: Grid location\nLine 2: Radio freq/call sign\nLine 3: Number by precedence\n\n(Source: ATP 4-02.5, Ch 6, para 6-4)"
},
{
  "front": "MEDEVAC 9-line: What are Lines 4-6?",
  "back": "Line 4: Special equipment\nLine 5: Number by type (litter/ambulatory)\nLine 6: Security (N/P/E/X)\n\n(Source: ATP 4-02.5, Ch 6, para 6-4)"
}
```

---

## Phase 2 Publications

### 1. TC 3-25.26 - Map Reading and Land Navigation

**Focus Areas:**
- Grid coordinate formats (4/6/8/10 digit)
- Terrain feature identification
- Compass use (declination, azimuths)
- Pace count and dead reckoning
- Map symbols and colors

**Card Count Target:** 40 cards

### 2. TC 3-22.9 - Rifle and Carbine

**Focus Areas:**
- Weapon specifications (ranges, rates)
- Zeroing procedures
- Engagement techniques
- Target detection
- Night firing considerations

**Card Count Target:** 35 cards

### 3. TC 7-22.7 - The NCO Guide

**Focus Areas:**
- NCO responsibilities
- Counseling types
- Leadership principles
- Training management
- Professional development

**Card Count Target:** 30 cards

### 4. TC 3-21.76 - Ranger Handbook (Select Topics)

**Focus Areas:**
- Patrol planning (OPORD format)
- Battle drills
- Knots and rope work
- Survival skills
- Call for fire basics

**Card Count Target:** 50 cards

---

## Phase 2 Card Format Template

```json
{
  "front": "[Single, specific question]",
  "back": "[Answer in ≤40 words]\n\n(Source: [Pub], [Chapter/Section])",
  "source_doc": "[Publication]",
  "source_page": [number],
  "source_para": "[Chapter X, para X-X]"
}
```

### Quality Checklist for Each Card

- [ ] Answer is ≤40 words (excluding source citation)
- [ ] Tests ONE piece of knowledge
- [ ] Question is specific (not "Tell me about X")
- [ ] Answer can be recalled in <15 seconds
- [ ] Source citation is accurate and verifiable
- [ ] No duplicate information from other cards

---

## Execution Plan

### Step 1: Fix Phase 1 Issues
1. Replace NCO Creed with 3 focused cards
2. Split MEDEVAC 9-line into 3 cards
3. Simplify salute cards
4. Review and trim any >50 word answers

### Step 2: Create Phase 2 Content
1. TC 3-25.26 Land Navigation (40 cards)
2. TC 3-22.9 Rifle and Carbine (35 cards)
3. TC 7-22.7 NCO Guide (30 cards)
4. TC 3-21.76 Ranger Handbook (50 cards)

### Step 3: Quality Review
1. Word count check on all answers
2. Duplicate detection
3. Source verification

**Total Phase 2 Target:** 155 new cards + ~10 fixed cards from Phase 1

---

*Plan created: 2026-02-19*
