import { Animated, StyleSheet, View } from "react-native";
import { SideScene } from "./side/SideScene";
import type { FantasyGame } from "./FantasyGame";

export function FantasyScene({
  game,
  scale,
  bob,
  scrollX,
  bounds,
  triggers,
}: {
  game: FantasyGame;
  scale: number;
  bob: Animated.Value;
  scrollX: Animated.Value;
  bounds: boolean;
  triggers: boolean;
}) {
  return (
    <View pointerEvents="none" style={s.wrap}>
      <SideScene
        game={game}
        scale={scale}
        bob={bob}
        scrollX={scrollX}
        bounds={bounds}
        triggers={triggers}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    backgroundColor: "#d9bd91",
  },
});
