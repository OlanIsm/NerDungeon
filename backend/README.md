# Nerdungeon backend

Next.js API for the Expo app. Run `npm --prefix backend run dev` and `npm --prefix frontend start` from repository root. Set `EXPO_PUBLIC_API_URL` in `frontend/.env` to the backend origin. For a physical device, use your computer's LAN address instead of `localhost`. The web build needs that value too when its origin differs from the API.

`GET /api/game` returns player resources, inventory and expeditions. `POST /api/game` accepts `start`, `complete` and `summon` actions; summons spend gems and return random items. `POST /api/game/forge` accepts one PDF or DOCX (25 MB maximum), stores it, and creates three starter chapters. Uploaded content is not parsed into questions yet. The battle scene remains the existing prototype; completion awards progress, XP and gold once per chapter.

State and uploads live in ignored `backend/data/`. This is a single shared development profile with no authentication and no production persistence. The game API is disabled in production unless `GAME_DEMO_MODE=1` is set explicitly. Supabase database and per-user accounts are deferred to the next session as requested. The existing `/api/me` Supabase auth route remains separate.

Checks: `npm --prefix backend test`, `npm --prefix backend run typecheck`, `npm --prefix backend run lint`, `npm --prefix backend run build`, plus the frontend typecheck and lint scripts.
