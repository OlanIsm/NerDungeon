import { Animated, Image, StyleSheet, View } from "react-native";
import { spriteArt, spriteSize, Tree } from "./environment/Placeholders";
import type { ActiveEncounter } from "./types";
import { depthAt, projectedX } from "./projection";

export function Player({ y, scale, bob, viewportHeight }: { y: number; scale: number; bob: Animated.Value; viewportHeight: number }) {
  const size = spriteSize.player;
  const spriteScale = scale * depthAt(y, viewportHeight);
  return <View testID="fight-player" accessibilityLabel="Hero seen from behind, facing north" style={{ position: "absolute", left: 180 * scale - size.width * spriteScale / 2, top: y * scale - size.height * spriteScale, width: size.width * spriteScale, height: size.height * spriteScale }}>
    <View style={s.shadow} />
    <Animated.View style={[s.full, { transform: [{ translateY: bob }] }]}>
      {spriteArt.player ? <Image source={spriteArt.player} resizeMode="contain" style={s.full} /> : <>
        <View style={[s.boot, { left: "20%" }]} /><View style={[s.boot, { right: "20%" }]} />
        <View style={s.cape} /><View style={s.hat} /><View style={s.hatBand} /><View style={s.pack} />
      </>}
    </Animated.View>
  </View>;
}

export function Enemies({ encounter, playerY, scale, complete, viewportHeight }: { encounter: ActiveEncounter; playerY: number; scale: number; complete: boolean; viewportHeight: number }) {
  const kind = encounter.boss ? "boss" : "enemy";
  const size = spriteSize[kind];
  const spriteScale = scale * depthAt(playerY - 115, viewportHeight);
  return <View pointerEvents="none" style={s.full}>
    {Array.from({ length: encounter.count }, (_, index) => {
      const x = projectedX(180 + (index - (encounter.count - 1) / 2) * 88, playerY - 115, viewportHeight);
      return <View key={index} testID={`fight-enemy-${index}`} accessibilityLabel={encounter.boss ? "Grove Guardian" : `Forest Imp ${index + 1}`} style={{ position: "absolute", left: x * scale - size.width * spriteScale / 2, top: (playerY - 115) * scale - size.height * spriteScale, width: size.width * spriteScale, height: size.height * spriteScale, opacity: complete ? 0.35 : 1 }}>
        <View style={s.shadow} />
        {spriteArt[kind] ? <Image source={spriteArt[kind]} resizeMode="contain" style={s.full} /> : encounter.boss
          ? <><Tree /><View style={s.bossFace} /><View style={[s.eye, { left: "35%", top: "44%" }]} /><View style={[s.eye, { right: "35%", top: "44%" }]} /></>
          : <><View style={s.slime} /><View style={[s.ear, { left: 0 }]} /><View style={[s.ear, { right: 0 }]} /><View style={[s.eye, { left: "28%" }]} /><View style={[s.eye, { right: "28%" }]} /></>}
      </View>;
    })}
  </View>;
}

const s = StyleSheet.create({
  full: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  shadow: { position: "absolute", bottom: "-3%", left: "4%", width: "92%", height: "17%", borderRadius: 50, backgroundColor: "#497b494d" },
  boot: { position: "absolute", bottom: 0, width: "23%", height: "20%", borderRadius: 5, backgroundColor: "#6f4b32" },
  cape: { position: "absolute", left: "10%", bottom: "12%", width: "80%", height: "68%", backgroundColor: "#316ac7", borderRadius: 15, borderBottomWidth: 4, borderBottomColor: "#234b93" },
  hat: { position: "absolute", left: "5%", top: 0, width: "90%", height: "46%", backgroundColor: "#315bae", borderTopLeftRadius: 25, borderTopRightRadius: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, transform: [{ rotate: "-9deg" }] },
  hatBand: { position: "absolute", top: "31%", left: "7%", width: "84%", height: "8%", backgroundColor: "#f4c24f", borderRadius: 5 },
  pack: { position: "absolute", top: "53%", left: "28%", width: "44%", height: "25%", backgroundColor: "#be813e", borderRadius: 5, borderWidth: 2, borderColor: "#efbe63" },
  slime: { position: "absolute", left: "9%", bottom: "5%", width: "82%", height: "81%", borderRadius: 18, backgroundColor: "#74ad4c", borderBottomWidth: 4, borderBottomColor: "#438747" },
  ear: { position: "absolute", top: "17%", width: "31%", height: "28%", backgroundColor: "#74ad4c", borderRadius: 5, transform: [{ rotate: "45deg" }] },
  eye: { position: "absolute", top: "42%", width: "12%", height: "16%", backgroundColor: "#fff2c8", borderRadius: 6, borderBottomWidth: 3, borderBottomColor: "#334936" },
  bossFace: { position: "absolute", top: "33%", left: "26%", width: "48%", height: "35%", backgroundColor: "#957341", borderRadius: 15 },
});
