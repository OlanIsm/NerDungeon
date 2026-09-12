# Nerdungeon — Development Workflow

## Core development loop

Nerdungeon is built as:

**one feature → review → fix → commit/push → next feature**

Do not build several roadmap milestones in one branch.

## Standard loop

### 1. Pick one milestone
Example: `M02 — Material Upload & Extraction`

### 2. Create a branch
```bash
git checkout main
git pull
git checkout -b feat/m02-upload-parser
```

### 3. Give one agent ownership
The builder reads:
- `AGENTS.md`
- `.agents/context.md`
- `.agents/roadmap.md`
- the active task file
- existing relevant code

### 4. Implement only that milestone
No future features.

### 5. Self-review
Check:
- git diff
- errors
- tests
- mobile UI
- security
- scope creep

### 6. Reviewer pass
A separate reviewer agent inspects the diff only.

### 7. Human review
You manually run and test the feature.

### 8. Fix issues
Same branch.

### 9. Commit and push
```bash
git add .
git commit -m "feat: add material upload and extraction"
git push -u origin feat/m02-upload-parser
```

### 10. Start next milestone
Only after current milestone is accepted.

---

# Recommended two-agent setup

Do NOT use two agents as two independent full-stack developers on the same milestone.

Use role separation:

## Agent A — Builder
Owns implementation for the active milestone.
Allowed to edit code.

## Agent B — Reviewer
Does not build new features.
Reviews:
- task compliance
- bugs
- security
- architecture
- tests
- scope creep
- mobile UX

This is the safest setup for your current Orca two-terminal workflow.

### Terminal 1 prompt
> You are the Builder Agent. Read AGENTS.md, .agents/context.md, .agents/roadmap.md, and the active task file. Implement only this milestone. Run relevant checks, summarize changes, then STOP. Do not commit, push, or start the next milestone.

### Terminal 2 prompt
> You are the Reviewer Agent. Read AGENTS.md, .agents/context.md, and the same active task file. Review the current git diff only. Do not implement new features. Return blockers, important issues, minor issues, and a manual test checklist.

---

# When true parallel work is okay

Parallelize only independent work.

Good:
- Agent A implements backend document extraction
- Agent B builds static mobile upload UI

Only do this if:
- files do not overlap
- API contract is already frozen
- one agent owns shared types/contracts

Bad:
- Agent A changes the question schema
- Agent B also changes question schema

Avoid competing ownership.

---

# Handoff discipline

After each accepted milestone, update `.agents/handoffs/current.md`.

Example:

```md
# Current Handoff

Completed:
- M02 PDF/DOCX upload
- extraction endpoint

Important decisions:
- max file size: 15 MB
- extracted text stored server-side

Known limitations:
- scanned PDFs are unsupported

Next milestone:
- M03 question generation
```

The next agent reads this before beginning.
