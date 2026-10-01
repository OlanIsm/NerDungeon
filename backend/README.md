# Nerdungeon API

Express 5 API for the Vite frontend. Game state and uploaded PDFs/DOCX files are stored per Supabase Auth user. New users start with one tutorial expedition; forged expeditions are added to that account.

## Backend structure

`src/app.ts` composes shared HTTP middleware and module routers; `src/server.ts` starts Express. `src/modules/account/` owns token verification and `/api/me`. `src/modules/game/` owns game routes, rules, summon data, PDF validation and state persistence. `src/platform/supabase.ts` creates Supabase clients; `src/platform/gemini.ts` calls Gemini. Keep new game behavior inside the game module and provider setup in `platform`; wire routes in `app.ts`.

1. Apply `supabase/migrations/20260930000000_game_backend.sql` to project `thlfrtxnxsuzgbjfoeel`.
2. Enable **Anonymous Sign-Ins** in Supabase Auth settings. The frontend creates one anonymous account per browser. Clearing browser storage loses access to that account until an account-linking flow is added.
3. Copy `backend/.env.example` to `backend/.env`. Fill the publishable and **server-only secret** keys from Supabase API settings. Copy `frontend/.env.example` to `frontend/.env` and fill its publishable key. Never put the secret key in the frontend.
   For PDF question generation, put the Google AI Studio key in `GEMINI_API_KEY` in **backend/.env only**. `GEMINI_MODEL` defaults to `gemini-3.5-flash`; set it to another available PDF/structured-output model if needed. Restart the backend after changing environment variables.
4. Run `npm run backend:dev` and `npm run dev` from the repository root. Open http://localhost:5173.

API: `GET /api/me`, `GET /api/game`, `POST /api/game` (`start`, `complete`, `summon`), `POST /api/game/forge` (one PDF or DOCX, 25 MB max). Every API request needs a Supabase access token in `Authorization: Bearer <token>`. Vite proxies `/api` to Express on port 3000.

PDF forge checks the PDF structure, rejects encrypted/corrupt or zero-page documents, and sends the PDF bytes to Gemini. It generates 1-5 chapters with summaries, topics, study material and 3-5 multiple-choice questions per chapter. Backend validation checks field sizes, unique questions/options, answer indices and physical source-page ranges before uploading the source PDF and saving state. Blank/unreadable documents and generation failures return an error without a new expedition. DOCX retains the existing starter-chapter behavior; Gemini processing currently covers PDF only.

Generated question banks, correct answers and explanations stay in server-side game state. API snapshots expose chapter material, question counts and source pages. Battle does not use these questions yet. Page references come from Gemini; range validation does not guarantee factual correctness, so review real PDFs before an MVP claim. Existing uploaded expeditions are not regenerated automatically.

Generation uses one synchronous request with a 90-second timeout. If large PDFs regularly exceed it, move processing into a background job. `npm --prefix backend test` and `npm --prefix backend run typecheck` run local checks. `npm --prefix backend run verify:pdf` runs a live smoke test using the local environment, Gemini quota and a temporary anonymous Supabase account; it checks generated content, Storage and reload, then removes its test file/account. On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked.
