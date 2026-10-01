# Nerdungeon API

Express 5 API for the Vite frontend. Game state and uploaded PDFs/DOCX files are stored per Supabase Auth user. New users start with one tutorial expedition; forged expeditions are added to that account.

## Backend structure

`src/app.ts` composes shared HTTP middleware and module routers; `src/server.ts` starts Express. `src/modules/account/` owns token verification and `/api/me`. `src/modules/game/` owns game routes, rules, summon data, PDF validation and state persistence. `src/platform/supabase.ts` creates Supabase clients; `src/platform/gemini.ts` calls Gemini. Keep new game behavior inside the game module and provider setup in `platform`; wire routes in `app.ts`.

1. Apply `supabase/migrations/20260930000000_game_backend.sql` to project `thlfrtxnxsuzgbjfoeel`.
2. Enable **Anonymous Sign-Ins** in Supabase Auth settings. The frontend creates one anonymous account per browser. Clearing browser storage loses access to that account until an account-linking flow is added.
3. Copy `backend/.env.example` to `backend/.env`. Fill the publishable and **server-only secret** keys from Supabase API settings. Copy `frontend/.env.example` to `frontend/.env` and fill its publishable key. Never put the secret key in the frontend.
   For PDF question generation, put the Google AI Studio key in `GEMINI_API_KEY` in **backend/.env only**. `GEMINI_MODEL` defaults to `gemini-3.5-flash`; set it to another available PDF/structured-output model if needed. Restart the backend after changing environment variables.
4. Run `npm run backend:dev` and `npm run dev` from the repository root. Open http://localhost:5173.

API: `GET /api/me`, `GET /api/game`, `POST /api/game` (`start`, `answer`, `complete`, `summon`), `POST /api/game/forge` (one PDF or DOCX, 25 MB max). Every API request needs a Supabase access token in `Authorization: Bearer <token>`. Vite proxies `/api` to Express on port 3000.

PDF forge checks the PDF structure, rejects encrypted/corrupt or zero-page documents, and sends the PDF bytes to Gemini. It generates 1-5 chapters with summaries, topics, study material and 3-5 multiple-choice questions per chapter. Backend validation checks field sizes, unique questions/options, answer indices and physical source-page ranges before uploading the source PDF and saving state. Blank/unreadable documents and generation failures return an error without a new expedition. DOCX retains the existing starter-chapter behavior; Gemini processing currently covers PDF only.

Generated question banks stay in server-side game state. Snapshots expose chapter material and the next battle question without its answer. After submission, feedback exposes that question's correct option and explanation. Page references come from Gemini; range validation does not guarantee factual correctness, so review real PDFs before an MVP claim. Existing uploaded expeditions are not regenerated automatically; chapters without question banks (including current DOCX starter chapters) cannot start a quiz. Existing tutorial chapters receive the built-in question bank without resetting resources or progress.

## Verified battles

- `start`: send `expeditionId` and integer `chapter`. Locked chapters are rejected. Starting the same unfinished chapter resumes its battle ID and saved answers; starting a different chapter replaces the unfinished attempt.
- `answer`: send `battleId`, `questionId` and integer `selectedIndex`. The backend accepts only the next question and computes correctness. Repeating the same answer is safe; changing an accepted answer is rejected.
- `complete`: send `battleId` after answering every question. Passing requires at least `ceil(questionCount * 0.6)` correct. The first passing completion of a chapter gives 450 gold and 100 XP. Failed attempts and replayed chapters give no reward. Retrying completion cannot duplicate rewards.

Answers, the active battle and the latest 20 completed attempts persist in the account's `game_states` JSON. The three visual encounters distribute that chapter's questions; Phaser cannot grant rewards. Longer audit history will need a separate result table.

Generation uses one synchronous request with a 90-second timeout. If large PDFs regularly exceed it, move processing into a background job. On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked.

## Verification

| Command from repository root | Checks |
| --- | --- |
| `npm --prefix backend test` | Battle ordering, scores, failed attempts, reward retries, locked chapters, PDF validation and summons. |
| `npm --prefix backend run typecheck` / `npm run typecheck` / `npm run lint` / `npm run build` | Backend/frontend types, frontend lint and production build. |
| `npm run test:web` | Mocked browser regression: auth session, upload, summon, quiz, Phaser traversal, resize, gate loading, reduced motion and asset retry. Requires frontend dev server. |
| `npm --prefix backend run verify:pdf` | Live Gemini/Supabase: two accounts, PDF/Storage, ordered battle, saved results, concurrent retries, token refresh, invalid uploads and denied cross-account access. |
| `npm run test:learning` | Live browser: tutorial, wrong-answer feedback, answer retry after an injected 503, resume after reload, real PDF generation, battle rewards and session persistence on mobile/desktop. Requires frontend and backend dev servers. |

Live checks use local environment keys, Gemini quota and temporary anonymous accounts; they remove their test users/files in `finally`. The browser check uses installed Chrome on Windows by default; set `CHROME_PATH` to override. Synthetic PDFs demonstrate the integration, not the quality of arbitrary textbooks. Screenshots are saved under ignored `test-results/`. No deployment is performed by these commands.
