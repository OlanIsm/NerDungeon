import { Animated, Image, StyleSheet, View } from "react-native";
import { DEPTH } from "../projection";
import { spriteArt, Tree } from "./Placeholders";

export function GrassGround() {
  return spriteArt.grass ? <Image source={spriteArt.grass} resizeMode="cover" style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: "#96c973" }]} />;
}

export function DirtPath({ width, height, scale }: { width: number; height: number; scale: number }) {
  const bottom = DEPTH.roadBottom * scale;
  const wedge = (DEPTH.roadBottom - DEPTH.roadTop) / 2 * scale;
  return <>
    <View style={{ position: "absolute", top: 0, left: (width - bottom) / 2 - 5 * scale, width: bottom + 10 * scale, height, borderLeftWidth: wedge, borderRightWidth: wedge, borderBottomWidth: height, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#bcc575", zIndex: 1 }} />
    <View testID="perspective-road" style={{ position: "absolute", top: 0, left: (width - bottom) / 2, width: bottom, height, borderLeftWidth: wedge, borderRightWidth: wedge, borderBottomWidth: height, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#e4be79", zIndex: 1 }} />
  </>;
}

export function PerspectiveGround({ width, height, scale, parallax }: { width: number; height: number; scale: number; parallax: Animated.Value }) {
  return <>
    <GrassGround />
    <DirtPath width={width} height={height} scale={scale} />
    <View style={{ position: "absolute", top: 0, width, height: 126 * scale, overflow: "hidden", opacity: 0.5, zIndex: 2 }}>
      <Animated.View style={{ transform: [{ translateY: parallax }] }}>
        {[-80, 0, 80].flatMap((y) => [15, 55, 92, 268, 305, 345].map((x) => <View key={`${x}-${y}`} style={{ position: "absolute", left: (x - 16) * scale, top: y * scale, width: 32 * scale, height: 45 * scale }}><Tree /></View>))}
      </Animated.View>
    </View>
  </>;
}
