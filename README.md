# Nerdungeon

React Native / Expo implementation of the five supplied Stitch screens:
Hub, Adventure Map, Bazaar, Armory and Battle Study.

## Run on your phone

Use Node 24 and npm:

```sh
npm --prefix frontend ci
npm start
```

Scan the Expo QR with a compatible Expo Go on Android or iPhone. Keep the
phone and computer on the same network. This project uses Expo SDK 57.
If your installed Expo Go does not support it, use the matching development
client. No Supabase configuration is needed for the UI preview.

For the browser preview: `npm run web`. For an installed Android emulator:
`npm run android`. Browser rendering is a convenience for iteration; it does
not certify native device behavior.

## Structure

- `frontend/src/screens/`: one React Native screen per Stitch page.
- `frontend/src/components/`: shared buttons, panels, icons, badges and meters.
- `frontend/src/theme.ts`: palette, type and reusable layout styles.
- `frontend/src/data/`: local demonstration data.
- `frontend/assets/stitch/`: original artwork, bundled locally, with source manifest.
- `backend/`: existing Supabase/server foundation, isolated from the UI.
- `docs/stitch/`: untouched HTML and screenshot references.

The earlier Next.js landing/dashboard/login UI has been removed. Its committed
version is recoverable from Git. The server helpers and unit tests were moved
into backend. Historical milestone documents are retained as history; the
current UI scope follows the user's replacement brief.

## Preview interactions

Navigate through the four bottom tabs. Open Battle from the Map or continue an
expedition from Hub. Select a PDF/DOCX up to 25 MB in the Forge. Choose an
inventory item and preview equipping it. Try correct and incorrect battle
answers, inspect feedback, retry, and exit. Bazaar actions show preview feedback.

Data, HP changes, item selection, gold, summons and timers are local illustrative
UI states from Stitch, not production game rules. Files are selected locally,
not uploaded or processed. No money is charged. Native auth, backend gameplay,
AI generation and durable inventory are not connected in this UI task.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npm --prefix backend ci
npm --prefix backend test
npm --prefix backend run typecheck
npm --prefix backend run build
```

`build` exports Android, iOS and web JS/assets; it does not produce an APK/IPA.
The optional browser interaction check uses Playwright and installed Edge:
run the web preview on port 8081, then `node scripts/verify-ui.cjs`.
Its screenshots go into `.impeccable/review/` and are explicitly marked web previews.

For manual native review, check all five pages at your device's font scale,
safe areas, Android Back, file picker, and keyboard/screen-reader navigation.
