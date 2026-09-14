import { useEffect, useState } from "react";
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  size,
  iconOffsetX = 0,
  selected,
  onPress,
}: BottomNavItemProps) {
  const [reveal] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    reveal.stopAnimation();
    if (selected) {
      Animated.spring(reveal, {
        toValue: 1,
        stiffness: 310,
        damping: 17,
        mass: 0.72,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(reveal, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [reveal, selected]);

  const frameStyle = {
    opacity: reveal,
    transform: [
      {
        translateY: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [76, 0],
        }),
      },
      {
        scale: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [0.88, 1],
        }),
      },
      { translateX: iconOffsetX },
    ],
  };
  const iconStyle = {
    transform: [
      {
        translateY: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -9],
        }),
      },
      {
        scale: reveal.interpolate({
          inputRange: [0, 0.72, 1],
          outputRange: [1, 1.2, 1.1],
        }),
      },
    ],
  };
  const labelStyle = {
    opacity: reveal,
    transform: [
      {
        translateY: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={screen}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.item}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.activeFrame, frameStyle]}
      >
        <LinearGradient
          colors={["#f0ad12", "#ffda55"]}
          locations={[0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.Image
        accessibilityIgnoresInvertColors
        source={icon}
        resizeMode="contain"
        style={[{ width: size, height: size }, iconStyle]}
      />
      {selected && (
        <Animated.Text numberOfLines={1} style={[styles.label, labelStyle]}>
          {screen}
        </Animated.Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  activeFrame: {
    position: "absolute",
    overflow: "hidden",
    top: 5,
    left: 12,
    right: 12,
    bottom: 5,
    borderWidth: 3,
    borderBottomWidth: 5,
    borderColor: "#ffe16b",
    borderBottomColor: "#a95b05",
    borderRadius: 16,
    backgroundColor: colors.gold,
  },
  label: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 11,
    fontFamily: fonts.heavy,
    fontSize: 12,
    lineHeight: 14,
    color: colors.wood,
    textAlign: "center",
  },
});
