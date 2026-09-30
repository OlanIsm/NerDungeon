# Nerdungeon API

Express 5 API for the Vite frontend. Game state and uploaded PDFs/DOCX files are stored per Supabase Auth user. New users start with one tutorial expedition; forged expeditions are added to that account.

1. Apply `supabase/migrations/20260930000000_game_backend.sql` to project `thlfrtxnxsuzgbjfoeel`.
2. Enable **Anonymous Sign-Ins** in Supabase Auth settings. The frontend creates one anonymous account per browser. Clearing browser storage loses access to that account until an account-linking flow is added.
3. Copy `backend/.env.example` to `backend/.env`. Fill the publishable and **server-only secret** keys from Supabase API settings. Copy `frontend/.env.example` to `frontend/.env` and fill its publishable key. Never put the secret key in the frontend.
4. Run `npm run backend:dev` and `npm run dev` from the repository root. Open http://localhost:5173.

API: `GET /api/me`, `GET /api/game`, `POST /api/game` (`start`, `complete`, `summon`), `POST /api/game/forge` (one PDF or DOCX, 25 MB max). Every API request needs a Supabase access token in `Authorization: Bearer <token>`. Vite proxies `/api` to Express on port 3000.

`npm --prefix backend test` and `npm --prefix backend run typecheck` check the backend. Forge stores the source document, but chapters still use starter text; document parsing and question generation are not implemented.
