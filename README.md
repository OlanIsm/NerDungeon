# Nerdungeon

Browser app with a mobile-sized layout. React + Vite renders Hub, Expedition, Bazaar, Bag, navigation, and battle controls. Phaser 3.90 renders the adventure world: the walk atlas, monsters, and eleven WebP parallax layers.

## Run

Use Node 24. Install dependencies once:

```sh
npm ci
npm --prefix frontend ci
npm --prefix backend ci
```

Start the API in one terminal:

```sh
npm run backend:dev
```

Start the web app in another terminal:

```sh
npm run dev
```

Open http://localhost:5173. Vite proxies /api to http://localhost:3000. Set VITE_API_URL in frontend/.env only when using another API origin. This is a web app; Expo Go and Android/iOS builds are no longer used.

Before starting, apply the Supabase migration, enable Anonymous Sign-Ins, and fill backend/frontend `.env` files as described in [backend/README.md](backend/README.md).

## Game and data

Phaser loads when entering Battle and is destroyed on exit. Doors slide shut before game assets load, remain closed for at least 1.5 seconds, and reopen when the scene is ready. The game stays inactive until opening completes. Walking stops during encounters, pause, and hidden browser tabs. Canvas resizes with the app shell. Reduced motion disables walking animation and door motion while keeping the loading hold.

Express handles uploads, summons, and chapter progress. Supabase Auth creates one anonymous account per browser; Postgres and Storage keep each account's data. Every new account starts with one tutorial expedition. Uploads support PDF/DOCX up to 25 MB; chapters currently derive from filenames, without AI question generation. Battle retains the encounter completion prototype.

## Verify

```sh
npm run typecheck
npm run lint
npm run build
npm run test:game
npm run test:web
npm --prefix backend test
npm --prefix backend run typecheck
```

Run the web app before test:web. Its browser test mocks the API, checks every React page, upload/summon requests, gate timing, Phaser WebGL animation, encounters, resize, and engine cleanup/re-entry. It uses installed Chrome; CHROME_PATH can override the executable. APP_URL can target Vite preview or another port. Screenshots go into ignored test-results/.

Production output is frontend/dist. Configure the deployment to proxy /api to the backend or build with VITE_API_URL. Hashed assets support browser caching when the host sends suitable cache headers.

The old ignored `backend/data` stays on disk but is not imported into Supabase automatically.
