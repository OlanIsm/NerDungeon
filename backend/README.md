# Nerdungeon backend

The existing Supabase helpers, auth validation and `GET /api/me` implementation
are preserved here as the server foundation. The old Next.js dashboard, landing,
login UI and associated UI browser tests were retired for the React Native replacement.

The new mobile UI uses local preview data and does not call this backend yet.
`/api/me` retains its existing cookie-based contract; native authentication is
not implemented in this UI task. No secrets belong in the frontend.

Install with `npm install` in this folder, configure `.env.local` from
`.env.example`, then `npm run dev`. Existing server/unit checks: `npm test`,
`npm run typecheck`, `npm run lint`.
