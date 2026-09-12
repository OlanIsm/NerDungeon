# Nerdungeon visual foundation

The identity follows the Visual Identity section of `.agents/context.md`: dark
stone surfaces, brass accents, squared RPG menu frames, and readable body text.
Home, Adventurer's Hall, and sign-in share these tokens and components. The
illustration is decorative; there are no gameplay controls, fake HP, or rewards.

## Dungeon gate

- Final asset: `public/art/dungeon-gate.webp` (1086 × 1448, lossless WebP).
- Original asset created for Nerdungeon with the built-in imagegen tool.
- No third-party game assets or reference images were used.
- PNG output was converted to WebP; Next.js serves appropriately sized images.

Generation prompt:

> A mysterious medieval stone doorway into a quiet library dungeon, amber
> torchlight at its sides, a small open book on a stone lectern near the doorway,
> worn slate stone steps. Original 2D pixel art, crisp square pixels, dark charcoal,
> blue-grey stone, muted moss and warm brass. Frontal flat game backdrop; portrait
> composition, centered doorway, dark edges for a framed menu illustration.
> No people, enemies, combat, treasures, coins, statistics, text, UI, or watermark.

## Font

MedievalSharp by Wojciech Kalinowski is self-hosted in `public/fonts/` under the
SIL Open Font License. Source: [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/medievalsharp).
The bundled `OFL-MedievalSharp.txt` preserves its license. No build-time font
download or external browser font request is required.
