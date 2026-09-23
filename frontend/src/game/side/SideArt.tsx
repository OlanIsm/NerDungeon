import { StyleSheet, View } from "react-native";

// Hand-drawn outline placeholders matching the sketch:
// white paper sky, yellow sun, blue mountain outlines,
// green pine outlines, stickman actors, grass platform + dirt.

export function SketchSun({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View style={[s.sun, { width: size * 0.52, height: size * 0.52, borderRadius: size * 0.26 }]} />
      {[
        { top: 0, left: "8%", width: "38%", rotate: "-12deg" },
        { top: "30%", right: 0, width: "22%", rotate: "72deg" },
        { bottom: "18%", left: "30%", width: "30%", rotate: "100deg" },
      ].map((ray: { top?: number | string; bottom?: number | string; left?: number | string; right?: number | string; width: string; rotate: string }, i) => (
        <View
          key={i}
          style={{
            position: "absolute", height: 3, backgroundColor: "#f2c200",
            width: ray.width as `${number}%`, top: ray.top as never, bottom: ray.bottom as never,
            left: ray.left as never, right: ray.right as never,
            transform: [{ rotate: ray.rotate }],
          }}
        />
      ))}
    </View>
  );
}

function OutlinePeak({ width, height, x, bottom }: { width: number; height: number; x: number; bottom: number }) {
  return (
    <View style={{ position: "absolute", left: x, bottom, width, height, alignItems: "center" }}>
      <View
        style={{
          width: 0, height: 0, borderLeftWidth: width / 2, borderRightWidth: width / 2,
          borderBottomWidth: height, borderLeftColor: "transparent", borderRightColor: "transparent",
          borderBottomColor: "#7a9cc6",
        }}
      />
      <View
        style={{
          position: "absolute", bottom: 5, width: 0, height: 0,
          borderLeftWidth: width / 2 - 9, borderRightWidth: width / 2 - 9,
          borderBottomWidth: height - 12, borderLeftColor: "transparent", borderRightColor: "transparent",
          borderBottomColor: "#fdfdf8",
        }}
      />
    </View>
  );
}

export function SketchMountains({ width, height }: { width: number; height: number }) {
  return (
    <View style={{ width, height }}>
      <OutlinePeak width={width * 0.42} height={height * 0.95} x={0} bottom={0} />
      <OutlinePeak width={width * 0.36} height={height * 0.7} x={width * 0.55} bottom={0} />
    </View>
  );
}

function JaggyLayer({ width, top, outer, inner }: { width: number; top: number; outer: string; inner: string }) {
  const h = width * 0.52;
  return (
    <View style={{ position: "absolute", top, width, height: h, alignItems: "center" }}>
      <View
        style={{
          width: 0, height: 0, borderLeftWidth: width / 2, borderRightWidth: width / 2,
          borderBottomWidth: h, borderLeftColor: "transparent", borderRightColor: "transparent",
          borderBottomColor: outer,
        }}
      />
      <View
        style={{
          position: "absolute", bottom: 4, width: 0, height: 0,
          borderLeftWidth: width / 2 - 7, borderRightWidth: width / 2 - 7,
          borderBottomWidth: h - 8, borderLeftColor: "transparent", borderRightColor: "transparent",
          borderBottomColor: inner,
        }}
      />
    </View>
  );
}

export function SketchPine({ width, height }: { width: number; height: number }) {
  const trunkH = height * 0.38;
  return (
    <View style={{ width, height }}>
      <View style={[s.trunk, { width: width * 0.09, height: trunkH }]} />
      <JaggyLayer width={width} top={height * 0.3} outer="#1e6b34" inner="#eef7ee" />
      <JaggyLayer width={width * 0.8} top={height * 0.12} outer="#1e6b34" inner="#eef7ee" />
      <JaggyLayer width={width * 0.58} top={0} outer="#1e6b34" inner="#eef7ee" />
    </View>
  );
}

export function SketchSignpost({ width, height }: { width: number; height: number }) {
  return (
    <View style={{ width, height }}>
      <View style={[s.post, { width: width * 0.1, height: height * 0.62 }]} />
      <View style={[s.board, { width, height: height * 0.32 }]} />
    </View>
  );
}

export function GrassTuft({ width }: { width: number }) {
  return (
    <View style={{ width, height: width * 0.4 }}>
      {[-18, 0, 18].map((rot) => (
        <View
          key={rot}
          style={{
            position: "absolute", bottom: 0, left: "42%", width: 3, height: "100%",
            backgroundColor: "#1e8a3c", borderRadius: 2, transform: [{ rotate: `${rot}deg` }],
          }}
        />
      ))}
    </View>
  );
}

export function Stickman({ height, color = "#1a1a1a", boss = false }: { height: number; color?: string; boss?: boolean }) {
  const head = height * (boss ? 0.3 : 0.34);
  return (
    <View style={{ width: head * 1.5, height }}>
      <View style={[s.head, { width: head, height, borderColor: color, borderRadius: head / 2 }]} />
      <View style={[s.limb, { top: head * 0.98, height: height * 0.38, backgroundColor: color }]} />
      <View style={[s.limb, { top: head * 1.08, left: "6%", height: height * 0.2, backgroundColor: color, transform: [{ rotate: "28deg" }] }]} />
      <View style={[s.limb, { top: head * 1.08, right: "6%", height: height * 0.2, backgroundColor: color, transform: [{ rotate: "-28deg" }] }]} />
      <View style={[s.limb, { top: head * 1.7, left: "22%", height: height * 0.3, backgroundColor: color, transform: [{ rotate: "16deg" }] }]} />
      <View style={[s.limb, { top: head * 1.7, right: "22%", height: height * 0.3, backgroundColor: color, transform: [{ rotate: "-16deg" }] }]} />
    </View>
  );
}

const s = StyleSheet.create({
  sun: { borderWidth: 3, borderColor: "#f2c200", backgroundColor: "#fffdf0" },
  trunk: { position: "absolute", bottom: 0, left: "45%", backgroundColor: "#fdfdf8", borderWidth: 2, borderColor: "#8a5a33" },
  post: { position: "absolute", bottom: 0, left: "45%", backgroundColor: "#fdfdf8", borderWidth: 2, borderColor: "#8a5a33" },
  board: { position: "absolute", top: 0, left: 0, backgroundColor: "#fdfdf8", borderWidth: 2, borderColor: "#8a5a33" },
  head: { alignSelf: "center", backgroundColor: "#fdfdf8", borderWidth: 3 },
  limb: { position: "absolute", left: "48%", width: 3, borderRadius: 2 },
});
