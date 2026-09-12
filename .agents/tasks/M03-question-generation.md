# M03 — AI Question Generation

## Goal
Generate a source-grounded question bank from extracted material.

## Scope
- server-side OpenAI call
- structured schema
- max 10 Easy
- max 10 Medium
- max 10 Hard
- exactly 3 choices
- correct answer
- explanation
- topic
- source excerpt/location where possible
- Zod validation
- verification/rejection strategy
- persistence

## Do not build
- combat
- report/regenerate UI
- inventory

## Acceptance criteria
- no more than 30 stored questions
- exactly 3 non-empty choices
- valid correct index
- explanation exists
- malformed AI output is rejected
- questions link to user's material
- API key remains server-only

## Human review focus
Manually inspect several generated sets for factual grounding and ambiguity.

## Stop condition
Stop before M04.
