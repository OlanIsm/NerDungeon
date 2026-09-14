# Nerdungeon — Stitch mobile UI

The five named screens in `docs/stitch/nerdungeon-educational-rpg-ui` are the
approved visual authority. Mode: Operate with an RPG game interface.

## Materials and palette
Warm parchment (#fff8f1, #fcedc9), timber (#6f4315, #5c3a21), gold (#ffba20),
and teal (#006a62). Preserve the supplied fantasy landscape, woodland map,
vault chest, equipment and pixel characters. Artwork provenance is recorded
in `frontend/assets/stitch/sources.json`.

## Type and controls
Rubik headings, Epilogue body, Space Grotesk labels, bundled with Expo fonts.
Wooden beveled buttons, inset parchment panels, compact resource badges,
four bottom navigation destinations. Navigation uses the supplied full-color
house, map scroll, treasure chest and backpack illustrations; resource badges
use the supplied coin, gem and XP artwork. Touch targets are at least 48 dp.

## Composition
Phone portrait first, scrollable content below a shared player HUD and above
fixed bottom navigation. Hub opens directly on the study forge and expeditions.
Map uses a 470 dp illustrated stage selector. Bazaar centers the original
chest and three relics. Armory shows the player, equipment grid and inspector.
Battle replaces navigation with Exit, HP bars, two original sprites and a
wood-framed three-option question.

The shared HUD follows the supplied game-status reference on every screen:
profile portrait on the left; level, player name, XP progress and rank in the
middle; then coin and gems in dark resource capsules. The shared header uses
the proportionally contained `frontend/assets/GUI/header.webp` frame, with its
compact profile and resources centered inside the wooden bounds.

Scrollable page content uses the blue patterned background artwork from
`frontend/assets/GUI/background.webp` instead of a flat application color.

Bottom navigation is icon-only at rest. The selected destination reveals a
rounded gold tile from below around its icon, animates its label into view and
gives the larger icon a contained pop in scale without crossing into page
content. The inactive destinations sit on the supplied four-slot wooden
`frontend/assets/GUI/navbar.webp` artwork, cropped proportionally rather than
stretched. The bar overlays scrolling content so the artwork's transparent
areas reveal the page beneath it.

The Study Forge uses `frontend/assets/GUI/scroll.webp` as its primary frame;
upload and action controls stay inside the parchment safe area.

Primary gold actions are resolution-independent layered gradients with a
subtle, periodic shine pass, heavy brown-gold labels and no leading icon.

## Implementation boundaries
Actual React Native primitives, no embedded HTML or WebView. Preview state
is local; backend rules and purchases are not implemented. Larger widths
center the portrait game frame. This release targets phones.
