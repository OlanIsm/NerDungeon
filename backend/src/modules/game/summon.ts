const items = [
  { name: "Blue Mage Robe", rarity: "Rare" },
  { name: "Quill Staff", rarity: "Epic" },
  { name: "Spectacles", rarity: "Rare" },
  { name: "HP Elixir", rarity: "Common" },
] as const;

// The sampler selects a uniform index from this same pool.
export const summonPool = items.map((item) => ({ ...item, chance: 100 / items.length }));
