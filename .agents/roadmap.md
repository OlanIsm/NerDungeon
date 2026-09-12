# Nerdungeon — MVP Roadmap

The order is intentional.

## M00 — Project Foundation
Goal: deployable mobile-first application baseline.

Includes:
- Next.js + TypeScript
- Tailwind
- environment strategy
- Supabase helpers
- responsive shell
- lint/typecheck/build
- `.env.example`

No auth, upload, AI, or dungeon yet.

---

## M01 — Authentication
Goal: user can sign in and access a protected dashboard.

Includes:
- Supabase Auth
- one MVP sign-in method
- session handling
- protected route
- sign out

---

## M02 — Material Upload & Extraction
Goal: upload one PDF or DOCX and extract clean text.

Includes:
- mobile upload UI
- file validation
- Supabase Storage
- material metadata
- PDF extraction
- DOCX extraction
- ready/failed states
- ownership checks

No AI yet.

---

## M03 — AI Question Generation
Goal: generate a validated source-grounded question bank.

Includes:
- up to 10 Easy
- up to 10 Medium
- up to 10 Hard
- exactly 3 choices
- correct answer
- explanation
- topic
- source evidence when available
- Zod validation
- verification/rejection pass

---

## M04 — Report & Regenerate
Goal: handle bad AI questions safely.

Includes:
- report
- reason
- optional note
- regenerate one question
- preserve difficulty
- keep source grounding

---

## M05 — Single-Battle Combat Prototype
Goal: validate the actual combat feeling.

Includes:
- Phaser scene
- player
- one enemy
- React question UI
- Easy / Medium / Hard
- 10/20/30 damage
- correct/wrong flow
- mobile portrait layout

---

## M06 — Full 3-Stage Dungeon
Goal: build the real run.

Includes:
- Stage 1: one enemy
- Stage 2: two enemies
- Stage 3: boss
- persistent player HP
- stage transitions
- fail/complete
- restart from Stage 1

No advanced boss mechanics.

---

## M07 — Learning Feedback
Goal: make mistakes useful.

Includes:
- taunting enemy line
- formal explanation
- source-backed explanation where practical

---

## M08 — Results & Rewards
Goal: trustworthy run result.

Includes:
- stage reached
- boss defeated
- accuracy
- difficulty statistics
- remaining HP
- server-side gold formula
- result screen

---

## M09 — Weak Topics & Learning Report
Goal: show what the learner knows and misses.

Includes:
- topic-level accuracy
- weak topics
- strong topics
- post-run report

---

## M10 — Review Runs & Spaced Repetition
Goal: revisit weak concepts without gold farming.

Includes:
- review mode
- weak-topic prioritization
- lightweight spaced repetition
- zero/near-zero repeat gold

---

## M11 — Basic Inventory
Goal: validate RPG progression with only 1–2 items.

Start with:
- healing potion
- shield

No gacha yet.

---

## M12 — Freemium Gate
Goal: enforce business rule.

Includes:
- first generation free
- additional generation gated
- entitlement model
- simple BIFEST-friendly paid/test unlock

Full production billing is post-MVP.

---

## Post-MVP only
- cosmetic gacha
- armory gacha
- advanced bosses
- multiple biomes
- multiplayer
- leaderboards
- social
- video input
- native packaging
