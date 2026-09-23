# Nerdius Performance Audit

No application files were modified during this audit. Static analysis used the current working tree. Runtime profiling used the last existing production web export because the current source tree is temporarily unbuildable after several PNG icons were replaced by WebP files without updating `frontend/src/assets.ts`.

## Executive findings

The observed browser footprint of approximately 700 MB is plausible and is primarily explained by decoded image memory, rendered image surfaces, browser caching, and GPU compositing. React state and the JavaScript heap are not the primary causes.

Measured facts:

- 154 raster assets occupy approximately **36.3 MB compressed**.
- Their estimated single-frame RGBA footprint is approximately **422.4 MB decoded**.
- Assets statically referenced by the application account for approximately **331.5 MB decoded**.
- Fight gameplay uses eleven `2048x1546` PNG layers. Each one is only 17–129 KB compressed but approximately **12.08 MB decoded**.
- The eleven fight layers represent approximately **132.86 MB** of unique decoded pixels.
- At a 390x844 viewport, the fight creates three `<img>` elements per parallax layer: **33 parallax image elements**.
- During the profiled fight, the page contained 111 images with **122.61 megapixels of natural image data** and approximately **32.73 megapixels of rendered image area**.
- JavaScript heap remained around **10–17 MB**.
- Gameplay does not use canvas or WebGL. It is rendered through React Native Web DOM elements, images, and `Animated.View`.
- The animation loop runs every frame in JavaScript, but it does not cause a full React rerender every frame.
- Hub, Expedition, Bazaar, and Bag remain mounted after their first visit.
- No strong unbounded memory leak was found. There is substantial intentional retention and browser image caching.

The highest-value work is asset sizing, parallax composition, route retention, and loading strategy. A Phaser migration is not required to fix the current memory problem.

---

# 1. Overall Architecture

## React Native / React Native Web

Nerdius uses Expo 57 with:

- React 19
- React Native 0.86
- React Native Web 0.21
- React Native `Animated`
- Standard React Native `View`, `Image`, `Text`, and `Pressable` components

The frontend entry point statically imports every screen in `frontend/App.tsx`. There is no router or route-level code splitting.

Navigation is controlled by local state in `GameApp`:

```tsx
const [screen, setScreen] = useState<Screen>("Hub");
```

Screens are selected through conditional rendering inside one component tree.

## Application pages

The application layer consists of:

- Upload and Hub: `frontend/src/screens/HomeScreen.tsx`
- Expedition and region flow: `frontend/src/screens/AdventureScreen.tsx`
- Inventory: `frontend/src/screens/InventoryScreen.tsx`
- Gacha: `frontend/src/screens/GachaScreen.tsx`
- Shared header and navigation: `frontend/App.tsx`

## Gameplay architecture

The active fight path is:

```text
BattleScreen
  └─ Journey
      └─ FantasyScene
          └─ SideScene
              ├─ 11 ParallaxLayer components
              ├─ Player View + Image
              ├─ Enemy Views + Images
              └─ ChunkDebug DOM elements
```

Relevant files:

- `frontend/src/screens/BattleScreen.tsx`
- `frontend/src/game/useFantasyGame.ts`
- `frontend/src/game/FantasyGame.ts`
- `frontend/src/game/FantasyScene.tsx`
- `frontend/src/game/side/SideScene.tsx`

## How gameplay objects are rendered

| Object | Current renderer |
| --- | --- |
| Player | DOM-backed React Native `View`, `Animated.View`, and `Image` |
| Enemies | React arrays containing `View` and `Image` |
| Background | Eleven React `ParallaxLayer` components |
| Each parallax copy | Separate DOM `<img>` |
| World movement | `Animated.Value` updated by a JavaScript RAF loop |
| Player bob | Animated transform on a DOM element |
| Enemy visibility/state | React conditional rendering |
| Damage effects | Not implemented yet |
| Particles | Not implemented yet |
| Canvas | None |
| WebGL | None |
| Phaser/Pixi/Three | None |

React is currently acting as the game scene graph. Decorative layers, actors, images, and debug objects all become React components and DOM elements.

This remains manageable for the current small scene. If particles, projectiles, many enemies, damage numbers, and additional combat effects are added, DOM and browser compositing work will grow.

There is older world-rendering code in `Actors.tsx`, `ChunkView.tsx`, and `game/environment/*`. It is not imported by the active `SideScene` path and should be tree-shaken from the production bundle.

---

# 2. React Rerender Investigation

## Main finding

The fight runs `requestAnimationFrame` every frame, but React does not perform a full rerender 60 times per second.

The loop is in `frontend/src/game/useFantasyGame.ts`:

```tsx
game.update((time - lastTime) / 1000);

if (game.distance !== distance) {
  scrollX.setValue(-game.distance * scale);
}

bob.setValue(
  game.state === GameState.walking && !game.paused
    ? Math.sin(game.walkTime * 13) * 2.5 * scale
    : 0,
);
```

`game.update()` mutates the game object. `scrollX` and `bob` are `Animated.Value` objects.

On React Native Web, these changes still execute through JavaScript and update DOM-backed transforms every frame. This avoids full React reconciliation but still creates continuous JavaScript and browser style/compositing work.

## Important rerender findings

### Fight animation loop

**File:** `frontend/src/game/useFantasyGame.ts`  
**Component:** `useFantasyGame`  
**Trigger:** `requestAnimationFrame`  
**Approximate frequency:** Usually 60 times per second  
**Severity:** High for web CPU/rendering; Low for React reconciliation

Changed every frame:

- Eleven parallax transforms
- Horizontal world position
- Player bobbing
- Player rotation
- Chunk debug transform

Cleanup is implemented correctly:

```tsx
return () => {
  cancelAnimationFrame(frame);
  subscription.remove();
};
```

### Chunk recycling

**Files:**

- `frontend/src/game/useFantasyGame.ts`
- `frontend/src/game/ChunkManager.ts`

React rerender is forced when the combined game/chunk revision changes:

```tsx
const nextRevision = game.revision + game.chunks.revision;

if (revision !== nextRevision) {
  revision = nextRevision;
  render(revision);
}
```

With a 420-unit chunk and a default speed of 96 units/second, a chunk is recycled approximately every:

```text
420 / 96 ≈ 4.4 seconds
```

This rerenders `Journey`, `FantasyScene`, `SideScene`, the eleven `ParallaxLayer` components, actors, and chunk debug elements. The frequency is too low to explain the 700 MB footprint.

**Severity:** Low.

### Gameplay state transitions

**File:** `frontend/src/game/FantasyGame.ts`  
**Trigger:** Encounter start, encounter reveal, completion, result, resize, pause, and speed changes  
**Frequency:** Event-driven  
**Severity:** Low

### Startup asset progress

**File:** `frontend/App.tsx`  
**Component:** `App`  
**Trigger:** Every shell asset completing load  
**Frequency:** Approximately 17 updates during startup  
**Severity:** Medium for startup; Low after startup

```tsx
setLoadedShellAssets((current) =>
  current.has(index) ? current : new Set(current).add(index),
);
```

The larger issue is the assets being loaded, not the number of progress rerenders.

### Fight preload progress

**File:** `frontend/src/screens/BattleScreen.tsx`  
**Component:** `BattleScreen`  
**Trigger:** Each of thirteen fight assets loading  
**Frequency:** Approximately thirteen renders per fight mount  
**Severity:** Low

### Navigation rerenders mounted pages

**File:** `frontend/App.tsx`  
**Component:** `GameApp`  
**Trigger:** Every navigation  
**Severity:** Medium

Navigation updates `entryOffset`, `visited`, and `screen`. `HomeScreen`, `AdventureScreen`, `GachaScreen`, and `InventoryScreen` are normal non-memoized children and can rerender when `GameApp` rerenders.

### Hidden gold-button animations continue

**File:** `frontend/src/components/GameUI.tsx`  
**Component:** `GoldButtonSurface`  
**Trigger:** Infinite `Animated.loop`  
**Frequency:** Continuous 1.2-second delay, 850 ms motion, and 1.5-second delay  
**Severity:** Medium

```tsx
const animation = Animated.loop(
  Animated.sequence([
    Animated.delay(1200),
    Animated.timing(shine, {
      toValue: 1,
      duration: 850,
      useNativeDriver: true,
    }),
    Animated.delay(1500),
  ]),
);
```

Cleanup is correct when the component unmounts. Visited pages are hidden with `display: none` instead of being unmounted, so hidden gold buttons can remain mounted and continue scheduling animation work.

---

# 3. Asset Audit

## Complete scan summary

Every PNG, WebP, GIF, and JPEG-like file under `frontend/assets` was scanned.

| Asset family | Files | Referenced | Compressed | Decoded estimate |
| --- | ---: | ---: | ---: | ---: |
| Parallax background pack | 11 | 11 | 0.48 MB | **132.86 MB** |
| GUI | 48 | 41 | 9.87 MB | **91.83 MB** |
| Character | 7 | 6 | 4.62 MB | **61.19 MB** |
| Items | 36 | 32 | 8.71 MB | **38.26 MB** |
| Maps | 5 | 4 | 7.26 MB | **30.00 MB** |
| Title | 1 | 1 | 0.79 MB | **15.63 MB** |
| Mini icons | 13 | 12 | 2.22 MB | **10.14 MB** |
| Stitch art | 14 | 14 | 0.89 MB | 9.82 MB |
| App/icon assets | 9 | 2 runtime/config references | 1.35 MB | 26.1 MB |
| Background Hills | 4 | 0 | 0.08 MB | 3.75 MB |
| **Total** | **154** | **123** | **36.3 MB** | **422.4 MB** |

Thirty-one files are not referenced by current application source. They account for 13.36 MB compressed and approximately 90.77 MB decoded if loaded.

Static `require()` does not necessarily make the browser download every image immediately, but it adds asset metadata to the bundle and makes accidental eager loading easy.

## Broken asset references in the current working tree

`frontend/src/assets.ts` references files that do not currently exist:

```text
assets/icon/nerdLoading.gif
assets/icon/home.png
assets/icon/map.png
assets/icon/chest.png
assets/icon/backpack.png
assets/icon/coins.png
assets/icon/gems.png
assets/icon/exp.png
```

The resized 96 px WebP icon replacements exist but are not referenced. The current source therefore cannot produce a clean new build until the asset registry is updated. Runtime profiling used the prior export containing the old PNG files.

## Top 20 most wasteful active assets

Display sizes and source/display ratios are approximate because the interface is responsive.

| Rank | Asset | Source | Compressed | Decoded estimate | Approximate display | Ratio/reason |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | `_01_ground.png` | 2048x1546 | 82.5 KB | 12.08 MB | 1118x844 per tile | Three DOM copies |
| 2 | `_02_trees and bushes.png` | 2048x1546 | 129 KB | 12.08 MB | 1118x844 | Three copies |
| 3 | `_03_distant_trees.png` | 2048x1546 | 59.1 KB | 12.08 MB | 1118x844 | Three copies |
| 4 | `_04_bushes.png` | 2048x1546 | 31.2 KB | 12.08 MB | 1118x844 | Three copies |
| 5 | `_05_hill1.png` | 2048x1546 | 24.8 KB | 12.08 MB | 1118x844 | Three copies |
| 6 | `_06_hill2.png` | 2048x1546 | 27.1 KB | 12.08 MB | 1118x844 | Three copies |
| 7 | `_07_huge_clouds.png` | 2048x1546 | 69.1 KB | 12.08 MB | 1118x844 | Three copies |
| 8 | `_08_clouds.png` | 2048x1546 | 18.5 KB | 12.08 MB | 1118x844 | Three copies |
| 9 | `_09_distant_clouds1.png` | 2048x1546 | 17.8 KB | 12.08 MB | 1118x844 | Three copies |
| 10 | `_10_distant_clouds.png` | 2048x1546 | 20.2 KB | 12.08 MB | 1118x844 | Three copies |
| 11 | `_11_background.png` | 2048x1546 | 17.2 KB | 12.08 MB | 1118x844 | Three copies despite speed 0 |
| 12 | `nerdius_title.png` | 2620x1564 | 812.5 KB | 15.63 MB | <=320x150 | 8.2–10.4x oversized |
| 13 | `nerdEatPdf.gif` | 768x768, 15 frames | 439.2 KB | 2.25 MB/frame; 33.8 MB all frames | 240x240 | Animated-frame memory |
| 14 | `icon/pdf.png` | 768x768 | 49.9 KB | 2.25 MB | 68x68 | 11.3x oversized |
| 15 | `soda-cutout.png` | 1254x1254 | 821.5 KB | 6.00 MB | 108–168 px | 7.5–11.6x oversized |
| 16 | `map/background.png` | 1086x1448 | 1.95 MB | 6.00 MB | About 390x520 | Eager startup preload |
| 17 | `map/dessert.png` | 1536x1024 | 1.25 MB | 6.00 MB | About 360x250 | About 4.1x oversized |
| 18 | `map/volcano.png` | 1536x1024 | 1.46 MB | 6.00 MB | About 360x250 | About 4.1x oversized |
| 19 | `map/kingdom.png` | 1536x1024 | 1.29 MB | 6.00 MB | About 360x250 | About 4.1x oversized |
| 20 | `GUI/text placeholder.png` | 2175x723 | 921.6 KB | 6.00 MB | <=300x100 | 7.25x oversized |

Other significant assets:

- `GUI/header.webp`: 2117x743, approximately 6 MB decoded.
- `GUI/navbar.webp`: 2172x724, approximately 6 MB decoded.
- `GUI/claimed.webp`: 1254x1254, 6 MB decoded, displayed at 140x140.
- `character/mc.png`: 768x768, 2.25 MB decoded, displayed near 126x126.
- Mini icons are generally 280x320 but displayed at 15–28 px.
- Inventory items are approximately 250–550 px and displayed around 65 px high.

## Parallax assets

All eleven files are 2048x1546 and decode to approximately 12.08 MB each:

```text
_01_ground.png
_02_trees and bushes.png
_03_distant_trees.png
_04_bushes.png
_05_hill1.png
_06_hill2.png
_07_huge_clouds.png
_08_clouds.png
_09_distant_clouds1.png
_10_distant_clouds.png
_11_background.png
```

Combined unique decoded footprint: **132.86 MB**.

## Character assets

| Path | Dimensions | Compressed | Decoded | Usage |
| --- | ---: | ---: | ---: | --- |
| `character/mc.png` | 768x768 | 217.8 KB | 2.25 MB | Fight player |
| `character/soda-cutout.png` | 1254x1254 | 821.5 KB | 6.00 MB | Fight enemies |
| `character/nerdEatPdf.gif` | 768x768, 15 frames | 439.2 KB | 2.25 MB/frame | Forge loader |
| `character/mc-walk/spritesheet.png` | 6288x800 | 1.35 MB | 19.19 MB | Present, not active |
| `character/nerd-loading/spritesheet.png` | 4608x768 | 1.16 MB | 13.50 MB | Present, not active |
| `character/nerd-well-actually/spritesheet.png` | 5376x768 | 588.8 KB | 15.75 MB | Present, not active |
| `character/soda.png` | 768x768 | 97.7 KB | 2.25 MB | Unreferenced alternative |

## Map assets

| Path | Dimensions | Compressed | Decoded | Usage |
| --- | ---: | ---: | ---: | --- |
| `map/background.png` | 1086x1448 | 1.95 MB | 6 MB | Startup and Region |
| `map/dessert.png` | 1536x1024 | 1.25 MB | 6 MB | Startup and Region |
| `map/volcano.png` | 1536x1024 | 1.46 MB | 6 MB | Startup and Region |
| `map/kingdom.png` | 1536x1024 | 1.29 MB | 6 MB | Startup and Region |
| `map/wholeMap.png` | 1049x1499 | 1.48 MB | 6 MB | Unreferenced |

## Inventory and mini icons

All 32 sliced inventory images are imported at module load by `frontend/src/data/inventory.ts`, although only one category is visible at a time.

- 24 equipment items: 248–330 px wide and 204–552 px high.
- Eight potion items: 275–313 px wide and 360–396 px high.
- Individual decoded footprint: approximately 0.26–0.69 MB.
- Total sliced-item decoded footprint: approximately 14 MB.
- Displayed item height: 65 px in `InventoryScreen`.

The twelve sliced mini icons are approximately 281–291x305–327, but display at 15–28 px. They are roughly 10–20 times oversized per axis.

---

# 4. Decoded Image Memory Estimate

The following formula was used:

```text
width × height × 4 bytes
```

These values are estimates. Browser decoding, pixel formats, GIF frame disposal, texture alignment, duplicate surfaces, and browser cache behavior can change actual memory use.

## Repository totals

| Scope | Compressed | Single-frame decoded estimate |
| --- | ---: | ---: |
| All 154 raster assets | 36.3 MB | **422.4 MB** |
| Statically referenced assets | 22.9 MB | **331.5 MB** |
| Unreferenced assets | 13.4 MB | 90.8 MB |

GIF frame memory adds uncertainty:

- `nerdEatPdf.gif`: 15 frames at 768x768.
- One frame: approximately 2.25 MB.
- All frames uncompressed: approximately 33.8 MB.
- Browsers may keep fewer frames, all frames, or internal optimized representations.

The prior export's `nerdLoading.gif` contains six 768x768 frames, representing approximately 13.5 MB if all frames are retained.

## Likely startup footprint

The explicit startup preload in `frontend/App.tsx` includes:

- Three large GUI backgrounds
- Seven resource/navigation icons
- Avatar
- Animated loader
- The 2620x1564 title
- All four map images

Approximate single-frame decoded footprint using the prior export: **about 70 MB**, rising toward **81 MB** if all loading-GIF frames are retained.

## Likely fight footprint

Unique fight assets:

- Eleven parallax layers: 132.86 MB
- Hero: 2.25 MB
- Enemy: 6 MB

Total unique decoded estimate: **approximately 141 MB**.

At 390x844, every layer creates three image elements. Runtime profiling reported:

- 111 `<img>` elements overall.
- 122.61 megapixels of natural image data across those elements.
- 32.73 megapixels of rendered image surface.

If every DOM image had an independent RGBA decode, 122.61 MP would represent approximately 490 MB. Browsers normally share decoded data for identical URLs, so this is an upper bound.

Rendered RGBA surface area alone is approximately:

```text
32.73 million × 4 ≈ 131 MB
```

GPU compositing, cached source textures, previous-page assets, fonts, browser overhead, and JavaScript make a 700 MB browser-process observation credible.

---

# 5. Asset Loading Strategy

## Startup

`frontend/App.tsx` renders every `shellAssets` item as a hidden 1x1 image and blocks the application until all `onLoadEnd` callbacks complete.

The shell currently includes all map assets even if the user only opens Hub.

**Finding:** unnecessary eager loading.

## Fight

`BattleScreen` blocks fight rendering until all thirteen fight assets load:

- Eleven parallax layers
- Player
- Enemy

This is acceptable for the current single fight theme, but there is no per-region or per-encounter asset manifest.

## Screen retention

The `visited` Set is monotonic:

```tsx
setVisited((current) =>
  current.has(next) ? current : new Set(current).add(next),
);
```

Once Hub, Expedition, Bazaar, or Bag has been visited, it remains mounted and is hidden with `display: none`.

Effects:

- Images stay represented in the DOM.
- Component state remains allocated.
- Component animation loops remain mounted.
- Browser-decoded resources may remain cached.
- DOM size grows as more tabs are visited.

## Inventory

All 32 item modules are statically registered. Only the current category is mounted, but visited images can remain in the browser cache.

## Duplicate and raw assets

Examples:

- Full inventory sheets coexist with sliced inventory files.
- PNG and WebP versions of several GUI assets coexist.
- `map/wholeMap.png` coexists with the split regions.
- Old and new character spritesheets coexist.
- New WebP navbar icons coexist with stale PNG references.

## Appropriate loading boundaries

- App startup: shell background, visible header/navigation, and fonts only.
- Entering Expedition: expedition-card assets.
- Selecting an expedition: map background and region assets.
- Opening region details: player and initial encounter assets.
- Starting fight: remaining encounter assets.
- Entering Bag: bag frame and current inventory category.
- Entering Potions: potion assets.
- Entering Bazaar: gacha assets.

---

# 6. Memory Leak Investigation

## Correct cleanup found

### Fight RAF and AppState listener

`frontend/src/game/useFantasyGame.ts` correctly cleans up:

```tsx
return () => {
  cancelAnimationFrame(frame);
  subscription.remove();
};
```

### Gold-button animation

`frontend/src/components/GameUI.tsx` stops its animation on unmount:

```tsx
return () => animation.stop();
```

### Back handler

`frontend/App.tsx` removes its `BackHandler` listener correctly.

## Bounded structures

- `visited` is bounded by known screens.
- `scrolls` is bounded by known screens.
- `loadedAssets` is bounded by thirteen assets.
- `shellAssets` is fixed.
- `ChunkManager.pool` is controlled by viewport coverage and resize limits.

No continuously growing array, Map, subscription, audio graph, canvas resource, or WebGL resource was found.

## Suspicious retention

The primary concern is lifecycle policy rather than a classical leak. Visited app screens remain mounted indefinitely.

Runtime measurements at 390x844:

| Stage | JS heap | Live elements | Images | Natural image MP |
| --- | ---: | ---: | ---: | ---: |
| Home | 10.5 MB | 305 | 51 | 16.96 |
| Expedition | 10.43 MB | 480 | 87 | 23.25 |
| Region | 11.99 MB | 450 | 81 | 23.83 |
| Detail | 15.10 MB | 485 | 86 | 19.11 |
| Fight | 13.16 MB | 572 | 111 | **122.61** |
| Home after fight | 17.18 MB | 480 | 87 | 23.25 |
| Second fight | 16.62 MB | 572 | 111 | 122.61 |

The second fight returned to the same live element and image counts. DOM counters dropped after browser garbage collection rather than growing monotonically. This does not demonstrate an unbounded leak.

Conclusions:

- No proven classical leak: **High confidence**.
- Intentional screen and image retention: **High confidence**.
- Browser decoded-image cache retaining fight textures after exit: **Plausible but not directly measurable through page APIs**.

The 1.8-second forge timeout has no cancellation, but it is singular and user-triggered. It is not a credible cause of hundreds of megabytes of memory.

---

# 7. Animation System Audit

| System | Current usage |
| --- | --- |
| GIF | Forge and startup loaders |
| React Native Animated | Page transitions, navbar, buttons, fight motion |
| requestAnimationFrame | Fight simulation loop |
| PNG layers | Eleven parallax layers |
| CSS/DOM transform | React Native Web output |
| Spritesheets | Present in assets but not used by current fight |
| Canvas | None |
| WebGL | None |
| Reanimated | Not installed |
| Animated WebP | None observed |

## Expensive patterns

### Full-canvas transparent parallax images

Each layer is a complete 2048x1546 image. Transparent or empty pixels still contribute to the decoded RGBA texture.

### Three DOM copies per layer

`SideScene.tsx` calculates:

```tsx
const copies = Math.ceil(viewportWidth / tileWidth) + 2;
```

At the profiled mobile size, `tileWidth` is already wider than the viewport, but the code still creates three copies. Eleven layers become 33 image elements.

### JavaScript-controlled movement

`scrollX` and `bob` change every frame through JavaScript. React reconciliation is avoided, but the web renderer still performs continuous style/compositor updates.

### Independent infinite button animations

Each gold button owns a separate `Animated.loop`, including buttons on retained hidden pages.

## Spritesheets and atlases

Spritesheets can reduce requests and object count for actual character frame animations. They do not automatically reduce decoded memory when the atlas itself is very large.

For the current parallax system, texture atlases are unlikely to solve the central issue because every layer is already one texture. Reducing dimensions, cropping transparent canvas, and reducing DOM copies matter more.

---

# 8. DOM and Component Complexity

Measured production export at 390x844:

- Home: 305 live elements.
- Expedition after retained Hub: 480 live elements.
- Fight: 572 live elements.
- Fight images: 111.
- Browser DOM counter during first fight: 1,582 nodes, including detached/internal nodes.
- Browser listener counter during first fight: 1,943, much of it related to React Native Web event handling.

Five hundred live elements is not automatically excessive. The concern is that many elements are large images or animated wrappers.

## High-multiplication components

### NineSliceFrame

`frontend/src/components/NineSliceFrame.tsx` creates nine `Image` components per frame.

Examples:

- Hub forge: 9 images.
- Three Hub cards: 27 images.
- Four Expedition cards: 36 images.
- Region detail card: 9 images.
- Inventory panels: 18 images.

### ParallaxLayer

Eleven components multiplied by three image copies create 33 image elements.

### Inventory

Twenty-four equipment cards mount at once in a non-virtualized wrapping `ScrollView`, plus profile and equipped-item images. This is moderate now but will scale poorly if the inventory grows significantly.

---

# 9. Background and World Rendering

The world is implemented in `frontend/src/game/side/SideScene.tsx`.

Each layer:

1. Uses a 2048x1546 source.
2. Has a speed multiplier.
3. Creates three horizontally arranged images.
4. Animates the parent row using `translateX`.
5. Is clipped inside an overflow-hidden scene.

Positive findings:

- No per-frame dimension changes.
- No animated `top`, `left`, width, or height.
- No blur/filter.
- Transform motion is more GPU-friendly than layout motion.

Costly findings:

- Eleven simultaneous full-screen transparent layers.
- Three rendered copies per layer.
- Continuous JavaScript-side Animated updates.
- A speed-zero background still receives three copies.
- Every layer uses a full RGBA canvas even when much of it is transparent.

The scrolling algorithm is structurally reasonable. Its texture and DOM strategy is expensive.

---

# 10. CSS and Visual Effect Audit

No occurrences were found for:

- `filter: blur()`
- `backdrop-filter`
- Animated gradients
- CSS masks
- WebGL shaders
- Large blur effects

Effects that do exist:

- Small header box shadow in `PlayerHeader.tsx`.
- Small text shadows in the header and Hub.
- Full-page opacity/transform transition in `App.tsx`.
- Multiple transparent fight layers.
- Gold-button gradient and shine animation in `GameUI.tsx`.

Small shadows and gradients are not primary suspects. Large transparent image layers and full-page compositing are more relevant.

---

# 11. Bundle Analysis

The existing web export contains one JavaScript bundle:

- Raw: **850,580 bytes**
- Gzip estimate: **238,153 bytes**
- Total export directory: approximately **52.8 MB**
- No route-level JavaScript chunks were found.

## Dependencies

No game engine or unusually heavy animation package is installed.

Main production dependencies:

- Expo runtime
- React and ReactDOM
- React Native Web
- Expo vector icons
- Expo fonts
- Expo document picker
- Expo linear gradient
- Safe-area context

The MaterialCommunityIcons font is approximately **1.3 MB**, although the UI uses only a subset of glyphs. This affects transfer and startup more than the 700 MB runtime memory issue.

Four Google font files add roughly another 600 KB.

No significant duplicate React version was found.

## Code splitting

There is no route-level code splitting. Every screen is statically imported by `App.tsx`, and Metro emits one bundle. This increases startup parsing and execution, although the JavaScript bundle remains much smaller than the image footprint.

---

# 12. PDF/PPT Processing Separation

The current document workflow is minimal and already separate from the fight renderer.

`HomeScreen.tsx` uses `expo-document-picker`, stores only the selected filename, waits 1.8 seconds, and navigates to Expedition.

Current limitations:

- The picker supports PDF and DOCX, not PPT/PPTX.
- No PDF extraction occurs in this frontend.
- No quiz-generation API is called.
- Uploaded document data does not reach gameplay.
- The backend currently contains authentication/Supabase scaffolding rather than material processing.

The architecture can cleanly separate:

## Application layer

- Authentication
- Upload and document processing
- Quiz generation
- Expedition metadata
- Inventory and gacha
- Settings and results
- Navigation

## Gameplay rendering layer

- Combat simulation
- Player and enemy presentation
- Parallax/world rendering
- Damage and particles
- Animation timing
- Question/combat event bridge

The current coupling point is small: `BattleScreen` receives generic navigation props. A future gameplay renderer can receive expedition and encounter data through a narrow prop/event interface without moving the application UI.

---

# 13. Is Phaser Needed?

## Current classification: A

**The current system can probably be optimized without Phaser.**

Evidence:

- Only one player and a small number of enemies are active.
- There is no physics.
- There are no particles.
- There are no collision-heavy systems.
- Animated combat effects are not implemented yet.
- React is not reconciling the complete scene at 60 FPS.
- JavaScript heap is small.
- Memory evidence points to oversized decoded images and repeated parallax surfaces.
- Phaser would decode the same 2048x1546 textures unless the assets were corrected first.

Phaser becomes more valuable if the fight evolves toward:

- Many animated actors
- Damage numbers
- Projectiles
- Particles
- Camera shake
- Hit effects
- Timelines
- More complex encounters
- A larger moving world

At that point Phaser could replace only the `FantasyScene` and `SideScene` rendering layer. Upload, inventory, gacha, expedition selection, settings, and results can remain React Native / React Native Web.

A renderer migration before correcting the assets risks recreating the same memory problem in WebGL textures.

---

# 14. Performance Priority Report

| Priority | Problem | Evidence | Estimated impact | Difficulty | Recommended action |
| --- | --- | --- | --- | --- | --- |
| P0 | Eleven 2048x1546 fight textures | 132.86 MB unique decoded; `SideScene.tsx` | Very high memory/GPU | Medium | Resize/crop for target viewport and test lower-resolution/WebP variants |
| P0 | Three copies per parallax layer | 33 layer images in the fight | Very high rendered surface area | Low | Calculate minimum copies; speed-zero layer needs one |
| P0 | Startup eagerly loads all map assets | `shellAssets` in `App.tsx` | High startup latency and about 24 MB decoded | Low | Load map assets at the Expedition/region boundary |
| P1 | Oversized title, PDF, enemy, map, GUI, mini icons | Ratios from 4x to 20x per axis | High memory and decode time | Low–Medium | Generate assets around actual 1x/2x display sizes |
| P1 | Source references deleted PNG icons | `frontend/src/assets.ts` | Blocks clean builds and current profiling | Low | Point registry to the existing 96 px WebP files |
| P1 | Visited pages remain mounted | `visited` in `App.tsx` | Medium retained DOM/images/animations | Medium | Retain only pages that require state preservation |
| P1 | Fight motion uses JS Animated values | `useFantasyGame.ts` | Medium–High CPU on weaker devices | Medium | Profile after asset fixes; then evaluate another renderer |
| P1 | 768 px animated GIF loaders | Six and fifteen full-size frames | Medium decoded-frame memory | Low | Resize and use an appropriate animated WebP/video/spritesheet format |
| P2 | NineSliceFrame creates nine images | `NineSliceFrame.tsx` | Medium DOM/image-node count | Medium | Profile CSS `border-image` or another stretch method |
| P2 | Hidden gold buttons keep animation loops | `GameUI.tsx` | Medium background CPU | Low | Pause hidden animations or unmount hidden screens |
| P2 | No route-level code splitting | Single 850 KB JavaScript bundle | Medium startup parse cost | Medium | Split Battle and secondary screens after asset work |
| P2 | Non-virtualized inventory grid | 24 cards mounted together | Low now, higher with growth | Medium | Virtualize when the item count grows materially |
| P2 | Full MaterialCommunityIcons font | Approximately 1.3 MB transfer | Medium startup transfer | Low–Medium | Replace common icons with a subset or static assets |
| P3 | Small shadows and text shadows | Several UI components | Low | Low | Leave until paint profiling proves otherwise |
| P3 | Chunk scene rerender every 4.4 seconds | Revision update | Low | Low | No immediate action |

---

# 15. Final Diagnosis

## Likely Primary Causes of 700 MB Memory Usage

### 1. Parallax source textures and rendered copies

**Evidence:** Eleven 2048x1546 PNGs, approximately 12.08 MB decoded each; three image elements per layer; 32.73 MP rendered image area during fight.  
**Files:** `frontend/src/game/side/SideScene.tsx`, `frontend/assets/parallax backgound pack/*`  
**Why:** Decoded textures and composited copies can consume hundreds of megabytes across browser renderer and GPU processes.  
**Confidence:** High

### 2. Oversized eagerly loaded application images

**Evidence:** Startup loads the 15.63 MB decoded title and 24 MB of map images before the user enters Expedition.  
**Files:** `frontend/App.tsx`, `frontend/src/assets.ts`  
**Why:** Small compressed files can still expand into large RGBA surfaces.  
**Confidence:** High

### 3. Browser image and GPU caches retaining displayed assets

**Evidence:** Fight unmount cleanup is correct, but Hub and Expedition remain mounted. Browser caches can retain decoded textures after DOM removal.  
**Files:** `frontend/App.tsx`  
**Why:** Cached decoded images and textures do not appear in JavaScript heap.  
**Confidence:** Medium–High

### 4. Animated GIF frame memory

**Evidence:** The 768x768 forge GIF has 15 frames, potentially about 33.8 MB fully decoded. The old loading GIF has six frames.  
**Files:** `frontend/assets/character/nerdEatPdf.gif`, startup loader references  
**Confidence:** Medium

### 5. React Native Web DOM and compositing overhead

**Evidence:** Fight uses 572 live elements, 111 images, and JavaScript-driven transforms rather than canvas/WebGL.  
**Files:** `frontend/src/game/side/SideScene.tsx`, `frontend/src/game/useFantasyGame.ts`  
**Confidence:** Medium

### Unlikely primary cause: React state

The measured JavaScript heap was approximately 10–17 MB. React does not rerender the full scene every frame.

**Confidence:** High

## What I Should Fix First

1. Reduce and crop the eleven fight-layer textures, then measure target-device memory again.
2. Stop creating three copies for every layer when one or two cover the viewport.
3. Remove map assets from global startup preload and load them at the Expedition boundary.
4. Resize the title, PDF icon, enemy, map, GUI, mini-icon, and inventory assets around their real 1x/2x display sizes.
5. Unmount or pause hidden screens and their animations instead of retaining every visited page.

## Should I Refactor to Phaser?

Not yet.

The current fight is small enough to optimize in React Native Web. The evidence shows that the immediate problem is texture size and repeated image surfaces. Phaser would improve scene ownership and future scalability, but it would not make oversized textures inexpensive.

After the five fixes above, profile again on the intended mobile hardware. If the fight then requires particles, projectiles, many enemies, damage effects, sprite animation, camera effects, or more complex world movement, move these parts to Phaser:

- `FantasyScene`
- `SideScene`
- Player and enemy rendering
- Parallax/background rendering
- Combat effects and particles
- Frame timing and camera control

Keep these parts in React Native / React Native Web:

- Authentication
- Material upload
- PDF/PPT processing
- Quiz generation
- Expedition/region selection
- Inventory
- Gacha
- Settings
- Results
- Modal and application UI

