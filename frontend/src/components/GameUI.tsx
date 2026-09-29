import {
  useEffect,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from "react";
import {
  AccessibilityInfo,
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
import { colors, fonts, outline, radii, rarity, ui } from "../theme";

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

export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
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
        tone === "gold" && s.goldButton,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed ? 2 : 0 }],
          borderBottomWidth: pressed ? outline.standard : outline.base,
        },
        style,
      ]}
    >
      <View pointerEvents="none" style={s.buttonHighlight} />
      {icon && <Icon name={icon} size={20} color={color} />}
      <Text
        style={[
          ui.title,
          {
            color,
            fontFamily: tone === "gold" ? fonts.heavy : ui.title.fontFamily,
            fontSize: 14,
            textAlign: "center",
            flexShrink: 1,
          },
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
export function RarityBadge({
  name,
  detail,
}: {
  name: keyof typeof rarity;
  detail?: string;
}) {
  const tone = rarity[name];
  return (
    <View
      style={[s.rarity, { backgroundColor: tone.fill, borderColor: tone.edge }]}
    >
      <View style={[s.rarityDot, { backgroundColor: tone.edge }]} />
      <Text style={[ui.label, { color: tone.ink }]}>
        {name}
        {detail ? ` ${detail}` : ""}
      </Text>
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
        accessibilityLabel={label ?? "Progress"}
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
    <View accessibilityRole="tablist" style={s.tabs}>
      {values.map((value) => (
        <Pressable
          key={value}
          accessibilityRole="tab"
          accessibilityLabel={value}
          accessibilityState={{ selected: value === selected }}
          onPress={() => onChange(value)}
          style={[
            s.tab,
            {
              backgroundColor: selected === value ? colors.teal : "transparent",
              borderColor: selected === value ? colors.edge : "transparent",
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
    borderRadius: radii.slot,
    borderBottomRightRadius: 18,
    borderWidth: outline.standard,
    borderBottomWidth: outline.base,
    borderColor: colors.edge,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  goldButton: {
    overflow: "hidden",
    width: "100%",
    minHeight: 52,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.edge,
    borderRadius: 14,
    borderBottomRightRadius: 20,
    backgroundColor: colors.gold,
    paddingVertical: 10,
  },
  buttonHighlight: {
    position: "absolute",
    top: 3,
    right: 10,
    left: 10,
    height: 3,
    borderRadius: 9,
    backgroundColor: "#ffffff66",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.inset,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.banner,
  },
  rarity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  rarityDot: { width: 6, height: 6, borderRadius: 3 },
  track: {
    height: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "#b0a386",
    padding: 1,
    backgroundColor: colors.inset,
    overflow: "hidden",
  },
  tabs: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    backgroundColor: colors.inset,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#c1b294",
  },
  tab: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
  },
});
