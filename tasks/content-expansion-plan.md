# Military Flash Cards - Content Expansion Plan

## Executive Summary

This plan outlines the strategy for creating additional flash card packs covering military publications from all U.S. armed services. The goal is to build a comprehensive study resource for service members across branches.

---

## Phase 1: Army Publications (Priority)

### Source: Army Publishing Directorate (armypubs.army.mil)

All U.S. Army publications are **public domain** under 17 U.S.C. § 105 - no copyright restrictions.

### Publication Categories

| Type | Full Name | Content Focus | Card Potential |
|------|-----------|---------------|----------------|
| **ADP** | Army Doctrine Publication | Foundation doctrine | Medium (concepts) |
| **ADRP** | Army Doctrine Reference Publication | Detailed doctrine | High (definitions) |
| **FM** | Field Manual | How to operate | Very High (procedures) |
| **ATP** | Army Techniques Publication | Tactical techniques | Very High (procedures) |
| **TC** | Training Circular | Training guidance | Very High (tasks) |
| **STP** | Soldier Training Publication | Individual tasks | Excellent (task steps) |
| **TM** | Technical Manual | Equipment operation | High (specs, procedures) |
| **AR** | Army Regulation | Policy/rules | Medium (requirements) |

### High-Priority Decks (Universal Army Knowledge)

#### Tier 1: Every Soldier Must Know
| Publication | Title | Est. Cards | Priority |
|-------------|-------|------------|----------|
| STP 21-1-SMCT | Soldier's Manual of Common Tasks (Warrior Skills Level 1) | 300+ | P1 |
| TC 7-21.13 | The Soldier's Guide | 150 | P1 |
| FM 7-22 | Army Physical Readiness Training | 200 | P1 |
| TC 3-21.76 | Ranger Handbook | 400 | P1 |
| FM 3-21.75 | Combat Skills (Soldier) | 250 | P1 |

#### Tier 2: Leadership & Development
| Publication | Title | Est. Cards | Priority |
|-------------|-------|------------|----------|
| TC 7-22.7 | The NCO Guide | 150 | P2 |
| ADP 6-22 | Army Leadership | 100 | P2 |
| FM 6-22 | Leader Development | 120 | P2 |
| AR 600-8-19 | Enlisted Promotions and Reductions | 80 | P2 |

#### Tier 3: Common Military Skills
| Publication | Title | Est. Cards | Priority |
|-------------|-------|------------|----------|
| TC 3-22.9 | Rifle and Carbine | 180 | P2 |
| TC 4-02.1 | First Aid (Combat Lifesaver) | 200 | P1 |
| TC 3-25.26 | Map Reading and Land Navigation | 250 | P2 |
| FM 3-09.31 | Call for Fire | 150 | P3 |

### MOS-Specific Decks

#### Combat Arms (High Demand)
| MOS | Title | Key Publications | Est. Cards |
|-----|-------|------------------|------------|
| 11B | Infantryman | STP 7-11B1-SM-TG, TC 3-21.8 | 400 |
| 11C | Indirect Fire Infantryman | STP 7-11C1-SM-TG | 200 |
| 13B | Cannon Crewmember | STP 6-13B1-SM-TG, TC 3-09.81 | 350 |
| 13F | Fire Support Specialist | STP 6-13F1-SM-TG | 250 |
| 19K | M1 Armor Crewman | STP 17-19K1-SM-TG | 300 |

#### Combat Support (Medium Demand)
| MOS | Title | Key Publications | Est. Cards |
|-----|-------|------------------|------------|
| 68W | Combat Medic | STP 8-68W13-SM-TG | 500 |
| 25B | Information Technology Specialist | STP 11-25B1-SM-TG | 200 |
| 91B | Wheeled Vehicle Mechanic | STP 9-91B1-SM-TG | 250 |

---

## Phase 2: Other Military Branches

### U.S. Marine Corps
**Source:** marines.mil/Publications

| Publication Type | Examples | Card Potential |
|-----------------|----------|----------------|
| MCWP | Marine Corps Warfighting Publication | High |
| MCRP | Marine Corps Reference Publication | High |
| MCTP | Marine Corps Tactical Publication | Very High |

**Priority Decks:**
- MCWP 3-11.2: Marine Rifle Squad
- MCRP 3-10A.4: Marine Rifle Marksmanship
- MCRP 3-02A: Survival
- Marine Corps Common Skills

### U.S. Navy
**Source:** nko.navy.mil (requires CAC access for many)

| Publication Type | Examples | Card Potential |
|-----------------|----------|----------------|
| NTTP | Navy Tactics, Techniques, and Procedures | High |
| NWP | Naval Warfare Publication | Medium |
| Rate Training Manuals | Enlisted rating guides | Very High |

**Priority Decks:**
- Bluejacket's Manual (unofficial but popular)
- BMR (Basic Military Requirements)
- Damage Control
- Watch Standing

### U.S. Air Force
**Source:** e-publishing.af.mil

| Publication Type | Examples | Card Potential |
|-----------------|----------|----------------|
| AFPD | Air Force Policy Directive | Low |
| AFI | Air Force Instruction | Medium |
| AFMAN | Air Force Manual | High |

**Priority Decks:**
- AFMAN 36-2203: Drill and Ceremonies
- AFI 36-2618: Enlisted Force Structure
- AFMAN 11-2XX: Aircrew Operations

### U.S. Coast Guard
**Source:** dcms.uscg.mil/directives

**Priority Decks:**
- Boat Crew Seamanship Manual
- Navigation Rules
- Search and Rescue

---

## Phase 3: Content Extraction Methodology

### Automated Pipeline

```
Document → PDF Extraction → Chunking → LLM Card Generation → Review → Publish
```

### Step 1: Document Acquisition
```python
# Download from official sources
sources = {
    'army': 'https://armypubs.army.mil',
    'marines': 'https://www.marines.mil/Portals/1/Publications',
    'airforce': 'https://www.e-publishing.af.mil',
}
```

### Step 2: PDF Processing
- Use existing m777-doc-pipeline infrastructure
- Extract text with page numbers preserved
- Chunk into semantic sections (500-1000 tokens)

### Step 3: LLM Card Generation

```python
CARD_EXTRACTION_PROMPT = """
Analyze this military training content and generate flashcards.

For each card, identify the TYPE:
1. PROCEDURE - "How do you...?" / Step-by-step answer
2. DEFINITION - "What is...?" / Clear definition
3. SPECIFICATION - "What is the [measurement/value] of...?"
4. SAFETY - "What must you NEVER do when...?" / Warning content
5. REQUIREMENT - "When must you...?" / Policy/regulation

Output JSON format:
{
  "cards": [
    {
      "type": "PROCEDURE",
      "front": "How do you clear an M4 carbine?",
      "back": "1. Point in safe direction\\n2. Remove magazine\\n3. Lock bolt to rear\\n4. Visually inspect chamber\\n5. Release bolt\\n6. Check chamber again\\n7. Place on SAFE",
      "source_section": "Chapter 3: Clearing Procedures",
      "difficulty": "easy"
    }
  ]
}

Content to analyze:
{chunk_text}
"""
```

### Step 4: Quality Assurance
- Automated duplicate detection
- SME review queue for accuracy
- Flag cards with low confidence
- Track rejection rate per source

### Step 5: Deck Publishing
```typescript
interface ContentPack {
  id: string;
  name: string;
  branch: 'army' | 'marines' | 'navy' | 'airforce' | 'coastguard';
  category: string;
  publications: string[];  // Source publications
  cards: Card[];
  version: string;
  lastUpdated: Date;
  estimatedStudyTime: number;  // minutes
}
```

---

## Phase 4: App Integration

### In-App Content Store

```
┌─────────────────────────────────────────┐
│  📚 Content Library                     │
├─────────────────────────────────────────┤
│  🎖️ Army                               │
│  ├── Common Soldier Skills     [FREE]   │
│  ├── Leadership & NCO           [PRO]   │
│  └── MOS Packs                  [PRO]   │
│      ├── 13B Cannon Crewmember          │
│      ├── 11B Infantryman                │
│      └── 68W Combat Medic               │
│                                         │
│  ⚓ Navy                                │
│  ├── Basic Military Req.       [FREE]   │
│  └── Rate Training              [PRO]   │
│                                         │
│  🦅 Marines                             │
│  └── Rifle Squad                [PRO]   │
└─────────────────────────────────────────┘
```

### Monetization Options

| Model | Pros | Cons |
|-------|------|------|
| **All Included ($4.99)** | Simple, current model | Limits future revenue |
| **Base + Packs ($2.99 + $0.99/pack)** | Scalable revenue | Complex IAP |
| **Subscription ($2.99/mo)** | Recurring revenue | Soldier hesitation |
| **Freemium + PRO ($4.99)** | Try before buy | May reduce conversions |

**Recommendation:** Keep current $4.99 one-time model for v1.0. Consider pack expansion for v2.0.

---

## Phase 5: Implementation Timeline

### Month 1: Foundation Content
- [ ] Extract STP 21-1 (Common Tasks Warrior Skills)
- [ ] Extract TC 7-21.13 (Soldier's Guide)
- [ ] Extract TC 4-02.1 (First Aid)
- [ ] Build content import pipeline
- **Goal:** 700 additional cards

### Month 2: Leadership & Skills
- [ ] Extract TC 7-22.7 (NCO Guide)
- [ ] Extract FM 7-22 (Physical Readiness)
- [ ] Extract TC 3-22.9 (Rifle/Carbine)
- [ ] Extract TC 3-25.26 (Land Navigation)
- **Goal:** 800 additional cards

### Month 3: MOS Expansion
- [ ] 11B Infantry STP
- [ ] 68W Combat Medic STP
- [ ] 13F Fire Support STP
- **Goal:** 1000 additional cards

### Month 4: Multi-Branch
- [ ] Marine Corps Common Skills
- [ ] Navy BMR
- [ ] Air Force Drill & Ceremonies
- **Goal:** 500 additional cards

---

## Technical Requirements

### Content Pipeline
1. **Document Storage:** S3 or local for source PDFs
2. **Processing:** Python scripts (extend m777-doc-pipeline)
3. **LLM API:** Claude API for card generation
4. **Review UI:** Simple web interface for SME review
5. **Export:** JSON files for app import

### App Updates
1. **Content versioning:** Track pack versions
2. **Incremental updates:** Only download changed cards
3. **Search enhancement:** Full-text search across all content
4. **Progress isolation:** Stats per content pack

---

## Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Card accuracy | >95% | SME review sampling |
| User retention | 7-day: 40% | Analytics |
| Study completion | >60% deck finish | In-app tracking |
| App rating | >4.5 stars | Store reviews |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Outdated publications | Version tracking, update notifications |
| Incorrect content | SME review, user feedback system |
| Copyright claims | Verify public domain status per document |
| Scope creep | Phase gates, priority tiers |

---

## Next Steps

1. **Immediate:** Download STP 21-1-SMCT from armypubs.army.mil
2. **This Week:** Set up extraction pipeline using Claude API
3. **This Month:** Generate first 500 verified cards
4. **Before v1.1:** Ship 3+ new content packs

---

## Appendix: Key URLs

- Army Pubs: https://armypubs.army.mil
- Marine Corps Pubs: https://www.marines.mil/News/Publications/MCPEL/
- Air Force e-Pubs: https://www.e-publishing.af.mil
- Navy NKO: https://www.netc.navy.mil/nko/ (CAC required)
- Coast Guard: https://www.dcms.uscg.mil/directives/

---

*Plan created: 2026-02-18*
*Status: Ready for execution*
