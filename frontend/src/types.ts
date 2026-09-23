export type Screen =
  | "Hub"
  | "Expedition"
  | "Region"
  | "RegionDetail"
  | "Bazaar"
  | "Bag"
  | "Battle";
export type ScreenProps = {
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
};
