# Nerdungeon — Product Context

## Product summary

Nerdungeon is a gamified self-study application for university students, while remaining usable by any learner.

A user uploads their own PDF or DOCX study material. One upload represents one chapter / learning unit. The system extracts the material and generates a question pool of up to 30 multiple-choice questions:

- 10 Easy
- 10 Medium
- 10 Hard

Each question has exactly 3 answer choices.

The generated material becomes a personalized 2D dungeon. The learner controls a small avatar and progresses through a three-stage run:

1. Stage 1 — one normal enemy
2. Stage 2 — two normal enemies
3. Stage 3 — one boss

The core idea is **knowledge as combat**.

The learner chooses an attack based on question difficulty:

- Easy question → 10% attack damage
- Medium question → 20% attack damage
- Hard question → 30% attack damage

If the learner answers correctly, the enemy takes that damage.

If the learner answers incorrectly, the enemy counterattacks and the player loses the same percentage amount associated with the chosen difficulty.

Player HP persists across all stages and does not reset between stages.

If the player dies, the run ends. They still receive rewards based on their last achieved progress, but any future attempt begins again from Stage 1.

## Wrong-answer learning behavior

Wrong answers should not merely show "incorrect".

The enemy gives a short, playful/taunting correction, followed by a clear formal explanation.

Example:

> Goblin: "Seriously? TCP lives at the Transport Layer."

Then:

> Explanation: TCP provides reliable transport-layer communication between applications.

The playful line is engagement. The explanation is the learning value.

## Question quality

The user does not review generated questions before beginning the dungeon.

Because of this, question generation quality is critical.

Bad questions must support:
- Report
- Regenerate

Question generation should remain grounded in the uploaded document.

Where practical, store source evidence:
- source excerpt
- source page / section
- topic

## Learning system

Planned learning mechanics:
- wrong-answer explanations
- weak-topic tracking
- post-dungeon performance report
- repeated exposure to weak concepts
- spaced repetition
- review runs

A review run may replay old material for learning, but should grant little or no gold so the same material cannot be farmed for rewards.

## Rewards and progression

Reward calculation may consider:
- difficulty attempted
- correct answers
- accuracy
- remaining HP
- stage reached
- dungeon completion
- boss defeat

Gold will later be used for:

### Cosmetic gacha
- character appearance
- armor skins
- weapon skins
- visual effects

### Armory / gameplay items
- healing potion
- shield
- remove one wrong option
- revive
- other combat-oriented boosts

The avatar is primarily cosmetic.

Advanced armory, gacha, and progression are not MVP priorities.

## Business model

Freemium.

Initial concept:
- first material upload / dungeon generation is free
- additional material generations/uploads require payment or premium access

For early BIFEST validation, payment can remain operationally simple. Payment-gateway integration should not block core-product validation.

## Target market

Primary:
- university students
- students preparing for quizzes/exams from their own lecture material

Secondary:
- any self-learner who wants to turn personal study material into a game-based quiz experience

## Competitive positioning

Nerdungeon is not "the first gamified quiz app".

Adjacent products already exist for:
- AI-generated quizzes from uploaded materials
- flashcards and practice tests
- game modes based on question sets

Nerdungeon's intended differentiation:
1. learner-provided material
2. AI-generated personalized questions
3. one continuous 2D RPG dungeon run
4. question difficulty as combat risk/reward
5. persistent HP across stages
6. learning retention through weak-topic tracking and repeated review

Positioning sentence:

> Nerdungeon turns your own study material into a personalized RPG dungeon where knowledge determines how hard you can attack — and how much damage you risk taking.

## MVP platform and technical direction

MVP platform:
- mobile-first responsive web app
- primarily used through phone browsers
- future path may include PWA / Capacitor for Android and iOS

Recommended stack:
- Next.js
- TypeScript
- Tailwind CSS
- Phaser 3 for 2D game visuals
- React/HTML UI for questions and controls
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- OpenAI API for question generation
- Zod for structured validation
- PDF text extraction
- Mammoth for DOCX extraction
- Vercel deployment

Architecture principle:
- React / Next.js owns app UI and question UI
- Phaser owns visual game scenes and animation
- server owns authoritative answer validation, rewards, inventory, and persistent run state
- AI keys never exist in the browser
