# Nerdungeon — Endpoint Plan

This document is a roadmap contract. Do NOT implement all endpoints at once.

Only implement endpoints required by the active milestone.

## M01 — Auth

Prefer Supabase Auth primitives.

### GET `/api/me`
Returns current user and entitlement summary.

---

## M02 — Materials

### POST `/api/materials`
Upload/register a PDF or DOCX.

Rules:
- authenticated user
- PDF/DOCX only
- size limit
- ownership

Response:
```json
{
  "materialId": "uuid",
  "status": "processing"
}
```

### GET `/api/materials/:id`
Returns material metadata and processing state.

### POST `/api/materials/:id/extract`
Optional internal/server action if extraction is asynchronous.

---

## M03 — Question generation

### POST `/api/materials/:id/generate-questions`

Rules:
- owner only
- extraction complete
- entitlement allows generation
- max 30 total
- max 10 each difficulty
- exactly 3 choices
- source-grounded
- schema validated before storage

Response:
```json
{
  "dungeonId": "uuid",
  "status": "ready",
  "counts": {
    "easy": 10,
    "medium": 10,
    "hard": 10
  }
}
```

Recommended stored question:
```json
{
  "id": "uuid",
  "difficulty": "hard",
  "topic": "Database Normalization",
  "prompt": "Which normal form removes partial dependency?",
  "choices": ["1NF", "2NF", "3NF"],
  "correctIndex": 1,
  "explanation": "Second Normal Form removes partial dependency...",
  "sourceExcerpt": "...",
  "sourceLocation": {
    "page": 4
  }
}
```

---

## M04 — Report / regenerate

### POST `/api/questions/:id/report`

Body:
```json
{
  "reason": "ambiguous",
  "note": "Optional note"
}
```

Possible reasons:
- incorrect_answer
- ambiguous
- unsupported_by_source
- duplicate
- malformed
- other

### POST `/api/questions/:id/regenerate`

Rules:
- same material
- same difficulty
- source-grounded
- validated before replacement

---

## M05-M06 — Runs

### POST `/api/dungeons/:id/runs`
Creates run:
- stage = 1
- HP = 100
- status = active

### GET `/api/runs/:id`
Returns authoritative run state.

### POST `/api/runs/:id/answer`

Body:
```json
{
  "questionId": "uuid",
  "selectedIndex": 2
}
```

Server determines:
- correctness
- player/enemy damage
- HP
- enemy death
- stage transition
- run end

Client must never submit:
- `correct`
- `damage`
- `gold`

---

## M08 — Results

### GET `/api/runs/:id/result`

Returns:
- completed
- stageReached
- bossDefeated
- accuracy
- remainingHp
- difficulty stats
- goldEarned

Gold is server-calculated.

---

## M09 — Learning

### GET `/api/learning/weak-topics`

### GET `/api/materials/:id/learning-report`

---

## M10 — Review

### POST `/api/materials/:id/review-runs`

Rules:
- prioritize weak topics
- little/no gold
- update mastery

---

## M11 — Inventory

### GET `/api/inventory`

### POST `/api/runs/:id/use-item`

Server validates:
- ownership
- quantity
- active run
- legal timing

---

## M12 — Entitlements

### GET `/api/entitlements`

Payment-provider-specific endpoints should be added only after provider selection.

---

# Suggested domain tables

Create only as needed:
- profiles
- materials
- dungeons
- questions
- question_reports
- runs
- run_answers
- topic_mastery
- review_schedule
- wallets
- inventory
- item_catalog
- entitlements

Every user-owned resource must be authorization/RLS protected.
