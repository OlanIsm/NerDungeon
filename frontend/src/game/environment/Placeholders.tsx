import { Image, StyleSheet, View, type ImageSourcePropType } from "react-native";
import type { PropKind } from "../types";

export type SpriteKind = PropKind | "player" | "enemy" | "boss" | "arena" | "bridge" | "river" | "grass";
// Add static require("../../../assets/fight/tree.webp") entries as final art arrives.
export const spriteArt: Partial<Record<SpriteKind, ImageSourcePropType>> = {};
export const spriteSize: Record<SpriteKind, { width: number; height: number }> = {
  tree: { width: 84, height: 100 }, bush: { width: 58, height: 36 },
  rock: { width: 30, height: 25 }, flower: { width: 20, height: 22 },
  ruins: { width: 54, height: 70 }, signpost: { width: 38, height: 43 },
  player: { width: 52, height: 72 }, enemy: { width: 44, height: 42 }, boss: { width: 86, height: 98 },
  arena: { width: 295, height: 250 }, bridge: { width: 215, height: 111 }, river: { width: 720, height: 92 }, grass: { width: 360, height: 420 },
};

export function Tree() {
  return <View style={s.full}>
    <View style={s.trunk} />
    <View style={[s.leaves, { left: "5%", top: "20%" }]} />
    <View style={[s.leaves, { right: "3%", top: "22%", backgroundColor: "#398f42" }]} />
    <View style={[s.leaves, { left: "24%", top: 0, backgroundColor: "#69b64e" }]} />
  </View>;
}
export function Bush() {
  return <View style={s.full}>
    <View style={[s.bush, { left: 0, bottom: 0 }]} />
    <View style={[s.bush, { right: 0, bottom: 0 }]} />
    <View style={[s.bush, { left: "24%", top: 0, backgroundColor: "#60b34b" }]} />
  </View>;
}
export function Rock() { return <View style={s.rock} />; }
export function Flower() {
  return <View style={s.full}><View style={s.stem} /><View style={s.flower} /><View style={s.pollen} /></View>;
}
export function Ruins() {
  return <View style={s.full}><View style={s.pillarLeft} /><View style={s.pillarRight} /><View style={s.ruinTop} /></View>;
}
export function Signpost() {
  return <View style={s.full}><View style={s.signPost} /><View style={s.signBoard} /><View style={s.signArrow} /></View>;
}

const props = { tree: Tree, bush: Bush, rock: Rock, flower: Flower, ruins: Ruins, signpost: Signpost };

export function PropSprite({ kind }: { kind: PropKind }) {
  const Shape = props[kind];
  return spriteArt[kind] ? <Image source={spriteArt[kind]} resizeMode="contain" style={s.full} /> : <Shape />;
}

export function EnvironmentProp({ kind, x, y, scale }: { kind: PropKind; x: number; y: number; scale: number }) {
  const size = spriteSize[kind];
  return <View style={{ position: "absolute", left: x - size.width * scale / 2, top: y - size.height * scale, width: size.width * scale, height: size.height * scale }}>
    <PropSprite kind={kind} />
  </View>;
}

export function ArenaClearing() {
  if (spriteArt.arena) return <Image source={spriteArt.arena} resizeMode="contain" style={s.full} />;
  return <View style={[s.full, { borderRadius: 130, backgroundColor: "#c9d783", borderWidth: 4, borderColor: "#a9c66b" }]} />;
}
export function RiverEdge() {
  if (spriteArt.river) return <Image source={spriteArt.river} resizeMode="stretch" style={s.full} />;
  return <View style={[s.full, { backgroundColor: "#65c6df", borderTopWidth: 5, borderBottomWidth: 5, borderColor: "#c2d481", borderRadius: 20 }]}>
    <View style={{ position: "absolute", top: "35%", left: "6%", width: "22%", height: 3, backgroundColor: "#bceaf1", borderRadius: 4 }} />
    <View style={{ position: "absolute", bottom: "25%", right: "5%", width: "21%", height: 3, backgroundColor: "#bceaf1", borderRadius: 4 }} />
  </View>;
}
export function Bridge() {
  if (spriteArt.bridge) return <Image source={spriteArt.bridge} resizeMode="contain" style={s.full} />;
  return <View style={[s.full, { backgroundColor: "#b97a40", borderLeftWidth: 6, borderRightWidth: 6, borderColor: "#80542c" }]}>
    {[1, 2, 3, 4, 5, 6].map((row) => <View key={row} style={{ position: "absolute", top: `${row * 14}%`, width: "100%", height: 2, backgroundColor: "#885930" }} />)}
  </View>;
}

const s = StyleSheet.create({
  full: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" },
  trunk: { position: "absolute", width: "18%", height: "47%", left: "41%", bottom: 0, backgroundColor: "#96643b", borderRadius: 5 },
  leaves: { position: "absolute", width: "63%", height: "61%", borderRadius: 50, backgroundColor: "#459b43", borderBottomWidth: 4, borderBottomColor: "#39813d" },
  bush: { position: "absolute", width: "55%", height: "84%", borderRadius: 30, backgroundColor: "#459845" },
  rock: { width: "94%", height: "88%", marginTop: "5%", backgroundColor: "#929e98", borderRadius: 8, borderBottomWidth: 5, borderBottomColor: "#758b7d", transform: [{ rotate: "-12deg" }] },
  stem: { position: "absolute", bottom: 0, left: "44%", height: "65%", width: "13%", backgroundColor: "#478144" },
  flower: { position: "absolute", top: 0, left: "10%", width: "80%", height: "66%", borderRadius: 20, backgroundColor: "#ed99b3" },
  pollen: { position: "absolute", top: "17%", left: "36%", width: "27%", height: "27%", borderRadius: 8, backgroundColor: "#ffe28b" },
  pillarLeft: { position: "absolute", left: 0, bottom: 0, width: "31%", height: "83%", borderRadius: 3, backgroundColor: "#a5b5a1" },
  pillarRight: { position: "absolute", right: 0, bottom: 0, width: "32%", height: "67%", borderRadius: 3, backgroundColor: "#94a792" },
  ruinTop: { position: "absolute", left: 0, top: 0, width: "77%", height: "27%", backgroundColor: "#c0c7ae", borderRadius: 4 },
  signPost: { position: "absolute", left: "44%", bottom: 0, width: "15%", height: "86%", backgroundColor: "#90623c" },
  signBoard: { position: "absolute", top: "8%", width: "100%", height: "40%", backgroundColor: "#dfb36d", borderRadius: 4 },
  signArrow: { position: "absolute", top: "18%", left: "41%", width: "18%", height: "18%", borderTopWidth: 3, borderLeftWidth: 3, borderColor: "#81552f", transform: [{ rotate: "45deg" }] },
});
