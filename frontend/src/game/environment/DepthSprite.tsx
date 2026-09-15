import { memo, useMemo, type PropsWithChildren } from "react";
import { Animated } from "react-native";
import { DEPTH } from "../projection";

// Scale around the bottom-center (feet) without a 3D transform or camera.
export const DepthSprite = memo(function DepthSprite({ position, x, y, width, height, viewportHeight, scale, order, children, testID }: PropsWithChildren<{
  position: Animated.Value; x: number; y: number; width: number; height: number;
  viewportHeight: number; scale: number; order: number; testID?: string;
}>) {
  const transform = useMemo(() => {
    const anchor = Animated.add(position, y * scale);
    const depth = anchor.interpolate({ inputRange: [0, viewportHeight * scale], outputRange: [DEPTH.farScale, DEPTH.nearScale], extrapolate: "clamp" });
    const horizontal = anchor.interpolate({ inputRange: [0, viewportHeight * scale], outputRange: [(x - 180) * scale * DEPTH.farSpread, (x - 180) * scale * DEPTH.nearSpread], extrapolate: "clamp" });
    return [
      { translateX: horizontal },
      { translateY: Animated.subtract(anchor, Animated.multiply(Animated.add(depth, 1), height * scale / 2)) },
      { scale: depth },
    ];
  }, [height, position, scale, viewportHeight, x, y]);
  return <Animated.View testID={testID} pointerEvents="none" style={{ position: "absolute", left: (180 - width / 2) * scale, top: 0, width: width * scale, height: height * scale, zIndex: order, transform }}>{children}</Animated.View>;
});
