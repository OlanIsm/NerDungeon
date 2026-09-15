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

This is a 2D, three-quarter rear view. The blue hero has a back-facing cloak, pack and boots. The hero's foot anchor stays at 70% of viewport height. Chunks move down to suggest walking north.

`projection.ts` defines depth: sprites scale from 0.65 at the top to 1.15 at the bottom; horizontal placement spreads from 0.42 to 1.16 around the road center. `DepthSprite` anchors scaling at the sprite's bottom center. Enemies use the same projection. The dirt road is a viewport-level trapezoid, 56 logical units wide at the top and 254 at the bottom. Keeping this road in camera space prevents its taper from resetting at chunk seams. Moving dirt marks, terrain features and props belong to recycled chunks.

The renderer uses React Native `View`, `Image` and `Animated.View` with a `requestAnimationFrame` simulation. Existing Expo 57, React Native, fonts and buttons are reused. No engine, physics, 3D geometry or new package is required.

Rendering order:

1. Grass, trapezoid road and distant forest (16% scroll speed).
2. Arena, river, bridge and path marks.
3. Props, player and enemies sorted by foot Y. Actor draw order updates as props pass their feet.
4. Foreground bushes, optional debug lines, then UI.

## Files and ownership

| File under `frontend/src/` | Responsibility |
| --- | --- |
| `screens/BattleScreen.tsx` | Viewport measurement, fight HUD, completion/result actions, exit/replay |
| `game/types.ts` | Explicit states and chunk/spawn types |
| `game/level.ts` | Speeds, timing, deterministic route and reusable chunk definitions |
| `game/ChunkManager.ts` | Bounded pool, positions, recycling and trigger lookup |
| `game/FantasyGame.ts` | State transitions, braking, encounters and result |
| `game/useFantasyGame.ts` | Animation values, frame loop and app visibility lifecycle |
| `game/projection.ts` | Depth scale and horizontal spread |
| `game/FantasyScene.tsx` | Scene composition and Y ordering |
| `game/ChunkView.tsx` | Moving terrain features and chunk debug visualization |
| `game/environment/DepthSprite.tsx` | Animated 2D perspective with a bottom-center anchor |
| `game/environment/Placeholders.tsx` | Reusable prop/terrain shapes and image replacement registry |
| `game/environment/PerspectiveGround.tsx` | Grass, persistent trapezoid road and far parallax |
| `game/Actors.tsx` | Back-facing player, imps and guardian placeholders |
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

Place PNG/WebP files in `frontend/assets/fight/`, then add static `require` entries to `spriteArt` in `game/environment/Placeholders.tsx`, for example:

```ts
export const spriteArt = {
  tree: require("../../../assets/fight/tree.webp"),
  player: require("../../../assets/fight/player-back.webp"),
};
```

Preserve the existing type annotation on the registry. Unknown entries use shapes. Draw the player from behind with a visible upright torso/cape, never as an overhead head icon. Prop and actor images use `contain`; transparent padding should be minimal. Their anchor is **bottom-center**, so the feet/trunk base belongs at the bottom center of the source image.

| Sprite | Logical box (width × height) |
| --- | --- |
| Player | 52 × 72 |
| Enemy / boss | 44 × 42 / 86 × 98 |
| Tree / bush | 84 × 100 / 58 × 36 |
| Rock / flower | 30 × 25 / 20 × 22 |
| Ruins / signpost | 54 × 70 / 38 × 43 |
| Arena / bridge / river | 295 × 250 / 215 × 111 / 720 × 92 |

Terrain image boxes are projected from their bottom-center anchors too. Grass uses `cover`. Keep the road's camera-space trapezoid when adding road textures; do not give each chunk its own independently tapered path.

## Add a chunk

1. Add its name to `ChunkType` in `types.ts`.
2. Add its `chunks` entry in `level.ts`, using existing prop kinds and local bottom-center coordinates. Keep props within the 360 × 420 logical chunk.
3. For an encounter, provide `triggerY` and spawn metadata. Each level step can override `enemyCount`.
4. Add special ground features to `ChunkView` only if existing components cannot express them.
5. Insert the type in `level` or `loop`. The pool, depth scaling, Y ordering and trigger flow work automatically.

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
