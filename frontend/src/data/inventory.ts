export type Item = { name: string; category: "Equipment" | "Potions"; image: number };

export const inventory: Item[] = [
  { name: "Blue Mage Robe", category: "Equipment", image: require("../../assets/item/sliced/armor/blue-mage-robe.png") },
  { name: "Quill Staff", category: "Equipment", image: require("../../assets/item/sliced/weapon/quill-staff.png") },
  { name: "Spectacles", category: "Equipment", image: require("../../assets/item/sliced/accessories/spectacles.png") },
  { name: "HP Elixir", category: "Potions", image: require("../../assets/item/sliced/potion/hp-elixir.png") },
];
