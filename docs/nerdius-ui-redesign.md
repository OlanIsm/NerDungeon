# Nerdius presentation redesign

## Direction contract

THESIS: Study materials become a legible illustrated journey, with one clear study action on Hub.

OWN-WORLD: Warm parchment, sage, honey gold, brown ink, rounded drawn outlines, inset highlights and tactile lower edges. Retain Rubik, Epilogue, existing character, chest and region art.

STORY: Upload a study file, resume an adventure, choose a chapter, inspect rewards and backpack contents.

FIRST VIEWPORT: Compact player HUD above a scroll upload and Continue Adventure card; Expedition leads with connected chapter nodes; Vault places a chest above its information panel; Bag centers the character above an image grid. Visible labeled navigation anchors all four.

FORM: User-pinned mobile RPG composition supersedes seed 3c7b5764. Code-led, native primitives; no generated raster frames. Press feedback and selected route flags are the signature interactions.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Existing behavior boundaries

- Frontend is a local preview; no upload processing, authentication or backend game integration is connected.
- Picker accepts PDF/DOCX up to 25 MB. PPT support is not implemented.
- Four expeditions have three chapters each. All chapters remain available. Completion markers derive only from existing progress; no locks or difficulty values are invented.
- Gacha supports single and ten-pull preview notices, two categories, and item/lore inspection. No currency is deducted.
- Inventory contains names, categories and images only. No rarity, quantity, description, equip or use handler exists. Preserve selection and expansion preview; do not invent inventory mutations.
- The battle simulation and backend remain outside the redesign.

## Validation target

React Native Web at 320, 375, 390, 414 and 1440px; overflow, navigation, file validation and forge flow, selected chapters, both summons, inventory selection and category changes, retained state, reduced motion, battle entry/exit. Run frontend typecheck/lint/export and existing backend and traversal checks. Native builds are exports, not device certification.
