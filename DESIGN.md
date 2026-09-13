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
fixed bottom navigation. Hub uses a 144 dp landscape, study forge and expeditions.
Map uses a 470 dp illustrated stage selector. Bazaar centers the original
chest and three relics. Armory shows the player, equipment grid and inspector.
Battle replaces navigation with Exit, HP bars, two original sprites and a
wood-framed three-option question.

The shared HUD follows the supplied player-strip reference on every screen:
profile portrait on the left, player name and star/XP progress in the middle,
then gold and gem blocks on the right. Its dark timber silhouette includes an
angled lower cut; the reference colors are translated into the established
timber, gold and teal roles.

## Implementation boundaries
Actual React Native primitives, no embedded HTML or WebView. Preview state
is local; backend rules and purchases are not implemented. Larger widths
center the portrait game frame. This release targets phones.
