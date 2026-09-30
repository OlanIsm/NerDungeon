# Fight traversal prototype

## Run

From the repository root:

```sh
npm run web
# Native Expo preview:
npm run android
```

Open **Map → Start Stage 2 (Battle!)** or **Replay**. The fight uses the full portrait viewport; the shared player header and bottom navigation return when you exit.

## Camera and rendering

This is a 2D side view. The hero stays at a fixed horizontal anchor with feet at 70% of viewport height while the world scrolls left to suggest walking east. `game.distance` drives one `Animated.Value`; each layer derives a wrapped offset from that value, so the 11 supplied images loop at independent speeds without React rendering every frame. All images retain one shared scale and vertical offset, preserving their authored alignment.

The hero uses `assets/character/mc.png`. Regular and boss encounters use the transparent `assets/character/soda-cutout.png` at different sizes. The static hero art gets a small walking bob and lean while traversal runs, then freezes with the world during encounters.

The renderer uses React Native `View`, `Image` and `Animated.View` with a `requestAnimationFrame` simulation. Existing Expo 57, React Native, fonts and buttons are reused. No engine, physics, 3D geometry or new package is required.

Rendering order:

1. Sky, clouds, hills, bushes, trees and ground from `_11_background.png` through `_01_ground.png`.
2. Optional chunk bounds and encounter trigger lines.
3. Hero and encounter sprites.
4. Battle HUD and controls.

## Files and ownership

| File under `frontend/src/` | Responsibility |
| --- | --- |
| `screens/BattleScreen.tsx` | Viewport measurement, fight HUD, completion/result actions, exit/replay |
| `game/types.ts` | Explicit states and chunk/spawn types |
| `game/level.ts` | Speeds, timing, deterministic route and reusable chunk definitions |
| `game/ChunkManager.ts` | Bounded pool, positions, recycling and trigger lookup |
| `game/FantasyGame.ts` | State transitions, braking, encounters and result |
| `game/useFantasyGame.ts` | Animation values, frame loop and app visibility lifecycle |
| `game/FantasyScene.tsx` | Full-screen scene wrapper |
| `game/side/SideScene.tsx` | Parallax loop, actor placement and debug visualization |
| `game/DebugControls.tsx` | Temporary traversal controls |

`frontend/App.tsx` mounts Battle outside the page ScrollView. Existing Hub, Bag and navigation behavior is preserved.

## Chunk recycling

Logical world width is 360 units; chunk height is 420. The pool starts with `ceil(viewportHeight / 420) + 2` slots. Each slot retains its ID, current sequence index, type, height, Y, generation, encounter flag and spawn metadata.

Only WALKING calls `ChunkManager.advance(distance)`. When a chunk's top passes below the viewport, the same object moves to `highestChunk.y - chunk.height` and receives the next definition. All chunk edges remain exactly one chunk height apart. The route is deterministic: straight forest, variant, one-enemy arena, straight forest, bridge, two-enemy arena, variant, boss arena. Following the boss, ordinary forest/bridge/river/ruin chunks repeat.

Viewport changes preserve relative trigger/player position and adjust offscreen coverage. Unseen top chunks can be removed with the sequence cursor rewound, so resizing does not skip future encounters.

## Encounter flow

```text
walking → encounterStarting → encounter → encounterComplete → walking
                           ↘ bossEncounter → encounterComplete → result
                                                                  ↓
                                                       Continue trail → walking
```

The final walking segment brakes over approximately 0.55 seconds toward the arena trigger. Braking remains inside `walking` to enforce the invariant that every other state has zero world motion. At the line, `encounterStarting` freezes the chunks, then reveals actors after 0.35 seconds. The arena trigger is marked consumed immediately, preventing retriggering.

**Complete Encounter** is the placeholder resolution action. It enters `encounterComplete`, holds actors briefly, cleans them up after 0.65 seconds and resumes walking. Boss completion enters `result`; **Continue trail** starts the normal loop, while **Replay** creates a fresh run. Integrate future quiz resolution by calling `completeEncounter()` only after the quiz resolves.

Debug controls: pause/resume, increase/decrease speed, trigger encounter, chunk bounds and encounter lines. The completion button is in the encounter footer. Debug encounters use the same state machine. Pausing also holds transition timers. App backgrounding/hidden web tabs suspend updates; unmount cancels the frame loop. Long frames are capped at 50 ms to prevent teleporting across triggers.

## Replace the art

Keep parallax replacements on the same canvas size and alignment as the current pack, then update the static `require` entries in `game/side/SideScene.tsx`. Character PNGs need transparent backgrounds and feet near the bottom edge because actors anchor to the ground line.

## Add a chunk

1. Add its name to `ChunkType` in `types.ts`.
2. Add its `chunks` entry in `level.ts`, using existing prop kinds and local bottom-center coordinates. Keep props within the 360 × 420 logical chunk.
3. For an encounter, provide `triggerY` and spawn metadata. Each level step can override `enemyCount`.
4. Add new terrain art only when the supplied parallax pack cannot express the region.
5. Insert the type in `level` or `loop`. Pooling and encounter triggers work automatically.

## Verification and scope

```sh
node scripts/verify-traversal.cjs
node scripts/verify-fight-ui.cjs
node scripts/verify-ui.cjs
npm run typecheck
npm run lint
npm run build
```

The simulation check covers seamless recycling, stable player/pool identities, 1/2/boss flow, strict encounter freeze, debug completion, pause, speed limits, long frames and resizing. The web check exercises real navigation, trapezoid/depth behavior, bridge, encounters, boss/result, narrow and desktop viewports. Screenshots are written under `.impeccable/review/fight-*.png`.

This is a traversal prototype with manual encounter resolution. It has no quiz rules, damage system, collision reactions, lanes, jumping or final artwork. `Animated` updates transforms without React scene renders every frame; React updates at chunk recycling, state changes and user controls. The small shape-based scene still uses a JavaScript frame loop; confirm frame rate on target Android hardware before increasing prop counts or adding heavy effects. Browser captures and bundle exports do not establish native-device performance.
