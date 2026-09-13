export type Screen = "Hub" | "Map" | "Bazaar" | "Armory" | "Battle";
export type ScreenProps = {
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
};
