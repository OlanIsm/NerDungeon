import { Image, StyleSheet, View } from "react-native";

type Images = {
  topLeft: number; top: number; topRight: number;
  left: number; center: number; right: number;
  bottomLeft: number; bottom: number; bottomRight: number;
};

export function NineSliceFrame({ images, top, bottom, side }: {
  images: Images; top: number; bottom: number; side: number;
}) {
  const piece = (source: number, style: object) => (
    <Image accessibilityIgnoresInvertColors source={source} resizeMode="stretch" style={style} />
  );
  return (
    <View pointerEvents="none" style={styles.frame}>
      <View style={[styles.row, { height: top }]}>
        {piece(images.topLeft, { width: side, height: top })}
        {piece(images.top, styles.fill)}
        {piece(images.topRight, { width: side, height: top })}
      </View>
      <View style={[styles.row, styles.middle]}>
        {piece(images.left, { width: side, height: "100%" })}
        {piece(images.center, styles.center)}
        {piece(images.right, { width: side, height: "100%" })}
      </View>
      <View style={[styles.row, { height: bottom }]}>
        {piece(images.bottomLeft, { width: side, height: bottom })}
        {piece(images.bottom, styles.fill)}
        {piece(images.bottomRight, { width: side, height: bottom })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  row: { flexDirection: "row" },
  middle: { flex: 1 },
  center: { flex: 1, height: "100%" },
  fill: { flex: 1, height: "100%" },
});
