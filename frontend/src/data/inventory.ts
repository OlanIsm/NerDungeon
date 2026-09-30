export type Item = {
  name: string;
  category: "Equipment" | "Potions";
  image: string;
};

export const inventory: Item[] = [
  {
    name: "Blue Mage Robe",
    category: "Equipment",
    image: new URL(
      "../../assets/item/sliced/armor/blue-mage-robe.png",
      import.meta.url,
    ).href,
  },
  {
    name: "Quill Staff",
    category: "Equipment",
    image: new URL(
      "../../assets/item/sliced/weapon/quill-staff.png",
      import.meta.url,
    ).href,
  },
  {
    name: "Spectacles",
    category: "Equipment",
    image: new URL(
      "../../assets/item/sliced/accessories/spectacles.png",
      import.meta.url,
    ).href,
  },
  {
    name: "HP Elixir",
    category: "Potions",
    image: new URL(
      "../../assets/item/sliced/potion/hp-elixir.png",
      import.meta.url,
    ).href,
  },
];
