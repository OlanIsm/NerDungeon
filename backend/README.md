# Nerdungeon backend

Next.js API for the React + Vite web app. Run `npm run backend:dev` and `npm run dev` from repository root. Open http://localhost:5173; Vite proxies /api to localhost:3000. Set `VITE_API_URL` in `frontend/.env` only when using a different API origin. The Express migration remains a separate backend step.

`GET /api/game` returns player resources, inventory and expeditions. `POST /api/game` accepts `start`, `complete` and `summon` actions; summons spend gems and return random items. `POST /api/game/forge` accepts one PDF or DOCX (25 MB maximum), stores it, and creates three starter chapters. Uploaded content is not parsed into questions yet. The battle scene remains the existing prototype; completion awards progress, XP and gold once per chapter.

State and uploads live in ignored `backend/data/`. This is a single shared development profile with no authentication and no production persistence. The game API is disabled in production unless `GAME_DEMO_MODE=1` is set explicitly. Supabase database and per-user accounts are deferred to the next session as requested. The existing `/api/me` Supabase auth route remains separate.

Checks: `npm --prefix backend test`, `npm --prefix backend run typecheck`, `npm --prefix backend run lint`, `npm --prefix backend run build`, plus the frontend typecheck and lint scripts.
