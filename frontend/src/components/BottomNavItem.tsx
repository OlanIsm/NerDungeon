import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { colors, fonts } from "../theme";
import type { Screen } from "../types";

type BottomNavItemProps = {
  screen: Screen;
  icon: ImageSourcePropType;
  size: number;
  iconOffsetX?: number;
  selected: boolean;
  onPress: () => void;
};

export function BottomNavItem({
  screen,
  icon,
  selected,
  onPress,
}: BottomNavItemProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={screen}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        s.item,
        selected && s.selected,
        pressed && { transform: [{ translateY: 2 }] },
      ]}
    >
      {selected && <View pointerEvents="none" style={s.highlight} />}
      <Image source={icon} resizeMode="contain" style={s.icon} />
      <Text style={[s.label, selected && s.activeLabel]}>{screen}</Text>
      {selected && <View style={s.marker} />}
    </Pressable>
  );
}
const s = StyleSheet.create({
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 15,
    gap: 1,
  },
  selected: {
    backgroundColor: colors.gold,
    borderColor: colors.edge,
    borderBottomWidth: 4,
    transform: [{ translateY: -5 }],
  },
  highlight: {
    position: "absolute",
    top: 3,
    left: 10,
    right: 10,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#fff0b0",
  },
  icon: { width: 39, height: 39 },
  label: {
    fontFamily: fonts.heading,
    fontSize: 11,
    lineHeight: 15,
    color: colors.parchment,
  },
  activeLabel: { color: colors.ink },
  marker: {
    position: "absolute",
    bottom: -6,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.edge,
    backgroundColor: colors.parchment,
  },
});
