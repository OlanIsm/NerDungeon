import {
  useEffect,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from "react";
import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
  StyleSheet,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { gui } from "../assets";
import { colors, ui } from "../theme";

export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
export function Icon({
  name,
  size = 22,
  color = colors.wood,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
export function Panel({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[ui.panel, style]}>{children}</View>;
}

function GoldButtonSurface() {
  const [shine] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(shine, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
      ]),
      { resetBeforeIteration: true },
    );
    animation.start();
    return () => animation.stop();
  }, [shine]);

  return (
    <View pointerEvents="none" style={s.goldSurface}>
      <Image
        source={gui.goldButton}
        resizeMode="stretch"
        style={s.goldSurfaceImage}
      />
      <Animated.View
        style={[
          s.shine,
          {
            transform: [
              { rotate: "18deg" },
              {
                translateX: shine.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-120, 540],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

export function Button({
  label,
  icon,
  onPress,
  tone = "wood",
  disabled = false,
  style,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  tone?: "wood" | "gold" | "teal" | "quiet";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const backgroundColor = {
    wood: colors.wood,
    gold: colors.gold,
    teal: colors.teal,
    quiet: colors.inset,
  }[tone];
  const color = tone === "wood" || tone === "teal" ? colors.white : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
        tone === "gold" && s.goldButton,
        style,
      ]}
    >
      {tone === "gold" && <GoldButtonSurface />}
      {icon && <Icon name={icon} size={20} color={color} />}
      <Text
        style={[
          ui.title,
          { color, fontSize: 14, textAlign: "center", flexShrink: 1 },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Badge({
  text,
  color = colors.wood,
  icon,
}: {
  text: string;
  color?: string;
  icon?: IconName;
}) {
  return (
    <View style={s.badge}>
      {icon && <Icon name={icon} color={color} size={14} />}
      <Text style={[ui.label, { color }]}>{text}</Text>
    </View>
  );
}

export function ImageBadge({
  text,
  source,
  size = 20,
}: {
  text: string;
  source: ImageSourcePropType;
  size?: number;
}) {
  return (
    <View style={s.badge}>
      <Image
        accessibilityIgnoresInvertColors
        source={source}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
      <Text style={[ui.label, { color: colors.wood }]}>{text}</Text>
    </View>
  );
}
export function Meter({
  value,
  color = colors.teal,
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <View style={{ gap: 4 }}>
      {label && <Text style={ui.label}>{label}</Text>}
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: value }}
        style={s.track}
      >
        <View
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: color,
            height: "100%",
            borderRadius: 6,
          }}
        />
      </View>
    </View>
  );
}
export function SectionTitle({
  title,
  aside,
  icon,
  color,
}: {
  title: string;
  aside?: string;
  icon?: IconName;
  color?: string;
}) {
  return (
    <View style={ui.between}>
      <View style={[ui.row, ui.flex]}>
        {icon && <Icon name={icon} color={color ?? colors.teal} size={20} />}
        <Text
          style={[ui.heading, { flexShrink: 1 }, color ? { color } : undefined]}
        >
          {title}
        </Text>
      </View>
      {aside && (
        <Text style={[ui.label, color ? { color } : undefined]}>{aside}</Text>
      )}
    </View>
  );
}
export function Tabs<T extends string>({
  values,
  selected,
  onChange,
}: {
  values: readonly T[];
  selected: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={ui.row}>
      {values.map((value) => (
        <Pressable
          key={value}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === selected }}
          onPress={() => onChange(value)}
          style={[
            s.tab,
            {
              backgroundColor: selected === value ? colors.wood : colors.inset,
            },
          ]}
        >
          <Text
            style={[
              ui.label,
              {
                color: selected === value ? colors.white : colors.wood,
                textAlign: "center",
              },
            ]}
          >
            {value}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: colors.edge,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  goldButton: {
    overflow: "hidden",
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },
  goldSurface: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  goldSurfaceImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  shine: {
    position: "absolute",
    top: -24,
    left: -40,
    width: 30,
    height: 96,
    backgroundColor: "#ffffff66",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.inset,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  track: {
    height: 9,
    borderRadius: 6,
    backgroundColor: "#dbc6a0",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: "#bba689",
  },
});
