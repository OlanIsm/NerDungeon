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
the wooden rectangle artwork from `frontend/assets/GUI`, with high-contrast
gold and teal status values layered above it.

Scrollable page content uses the blue patterned background artwork from
`frontend/assets/GUI/background.png` instead of a flat application color.

Bottom navigation is icon-only at rest. The selected destination reveals a
filled gold bookmark from below, animates its label into view and gives the
larger icon a contained pop in scale without crossing into page content.

Primary gold actions use the supplied `gold button.png` surface with a subtle,
periodic shine pass rather than a flat fill.

## Implementation boundaries
Actual React Native primitives, no embedded HTML or WebView. Preview state
is local; backend rules and purchases are not implemented. Larger widths
center the portrait game frame. This release targets phones.
