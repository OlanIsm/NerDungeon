# Nerdungeon — Agent Operating Rules

This repository is developed milestone-by-milestone. Do not implement multiple milestones in one pass.

## Prime directive

Work on exactly one milestone at a time.

For every milestone:

1. Read `.agents/context.md`
2. Read `.agents/roadmap.md`
3. Read the current task file in `.agents/tasks/`
4. Inspect the existing code before changing anything
5. Implement only the requested scope
6. Run lint/typecheck/tests/build relevant to the changed code
7. Review your own diff
8. Report what changed, files changed, commands run, known issues, and manual test steps
9. STOP and wait for human review
10. Do not start the next milestone until the human explicitly says to continue

## Git rules

Agents may prepare commits, but must not push unless explicitly asked.

Recommended branch format:

- `feat/m00-foundation`
- `feat/m01-auth`
- `feat/m02-upload-parser`

One milestone = one branch = one reviewable PR/commit series.

Never mix unrelated refactors into a feature milestone.

## Scope rules

- Prefer the smallest implementation that validates the feature.
- Do not add future features "while you are here".
- Do not silently change API contracts.
- If a task depends on an unfinished earlier milestone, stop and report the dependency.
- Never let two agents edit the same feature files at the same time.
- Shared contracts/types must have one owner at a time.
- Keep mobile-first behavior in mind. MVP is a responsive web app used primarily on phones.

## Product rules

Nerdungeon is a learning product first and a game second.

Generated questions must stay grounded in the user's uploaded material.

Do not invent facts outside the uploaded source when generating questions.

Every wrong answer should be explainable.

The MVP must support:

- PDF and DOCX only
- individual learning
- 3-option multiple choice
- Easy / Medium / Hard
- up to 10 questions per difficulty
- up to 30 questions per dungeon
- persistent player HP across the whole dungeon
- 3 stages: 1 enemy, 2 enemies, boss
- wrong-answer correction/explanation
- report and regenerate bad questions
- post-run learning report
- weak-topic tracking
- no reward farming from replaying the same material

## Definition of done

A milestone is done only when:

- acceptance criteria pass
- lint/typecheck pass
- relevant tests pass
- mobile layout is manually checked when UI changed
- API error states are handled
- no secrets are committed
- the diff is reviewed
- documentation is updated if contracts changed
- the agent stops for human approval



## Visual design rule

Nerdungeon is visually a game product, not a SaaS product.

Any user-facing page should follow the Nerdungeon RPG/dungeon visual identity unless the active milestone explicitly requires an unstyled technical prototype.

Do not default to:

- white SaaS dashboards

- generic startup cards

- corporate gradients

- admin-panel layouts

Prefer:

- dungeon/fantasy game framing

- RPG HUD patterns

- game-like cards and buttons

- mobile-first game navigation

- immersive but readable styling

