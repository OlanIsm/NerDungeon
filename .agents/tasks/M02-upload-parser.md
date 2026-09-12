# M02 — Material Upload & Extraction

## Goal
An authenticated user can upload one PDF or DOCX and the server extracts clean text.

## Scope
- upload screen
- PDF/DOCX validation
- file-size limit
- Supabase Storage
- material metadata
- PDF extraction
- DOCX extraction
- processing/ready/failed state
- ownership validation
- useful errors

## Do not build
- AI generation
- dungeon
- question UI

## Acceptance criteria
- valid PDF succeeds
- valid DOCX succeeds
- unsupported type fails clearly
- oversized file fails clearly
- another user cannot access the material
- extracted text is stored server-side
- phone upload UI is usable

## Stop condition
Stop for human review.
