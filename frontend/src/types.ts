export type Screen = "Hub" | "Map" | "Bazaar" | "Bag" | "Battle";
export type ScreenProps = {
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
};
