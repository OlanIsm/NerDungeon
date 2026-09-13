import type { IconName } from "../components/GameUI";
export type Item = {
  name: string;
  short: string;
  icon: IconName;
  category: string;
  level: string;
  description: string;
};
export const inventory: Item[] = [
  {
    name: "Rune Quill",
    short: "Quill",
    icon: "fountain-pen-tip",
    category: "Equipment",
    level: "L.5",
    description:
      "A sharpened scholar quill carved from ancient elderwood. Writes answers in blinding light.",
  },
  {
    name: "Bronze Dagger",
    short: "Dagger",
    icon: "sword",
    category: "Equipment",
    level: "L.3",
    description: "Quick for slashing down rogue misspellings in dungeon texts.",
  },
  {
    name: "Oak Tome",
    short: "Oak Tome",
    icon: "book-open-variant",
    category: "Equipment",
    level: "L.2",
    description:
      "Sturdy wood-bound grimoire containing basic grammatical incantations.",
  },
  {
    name: "Starlight Gem",
    short: "Star Gem",
    icon: "diamond-stone",
    category: "Equipment",
    level: "L.4",
    description:
      "Faintly illuminates tricky dungeon questions with cosmic hints.",
  },
  {
    name: "Scholar’s Spectacles",
    short: "Spectacles",
    icon: "glasses",
    category: "Equipment",
    level: "L.5",
    description:
      "Ground and polished by ancient academy tutors. Automatically eliminates one incorrect answer choice during multiple-choice boss trivia battles.",
  },
  {
    name: "Iron Shield",
    short: "Shield",
    icon: "shield-outline",
    category: "Equipment",
    level: "L.1",
    description:
      "Heavy slab of beaten iron. Mitigates penalty damage from wrong answers.",
  },
  {
    name: "HP Elixir",
    short: "HP Elixir",
    icon: "bottle-tonic-plus-outline",
    category: "Potions",
    level: "×5",
    description:
      "Instantly restores 250 Health points when trivia traps trigger.",
  },
  {
    name: "Retry Scroll",
    short: "Retry",
    icon: "script-text-outline",
    category: "Spells",
    level: "×2",
    description:
      "Grants a second attempt at any failed riddle without losing a heart.",
  },
];
