import type { ComponentProps, PropsWithChildren } from "react";
import {
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
        style,
      ]}
    >
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
}: {
  title: string;
  aside?: string;
  icon?: IconName;
}) {
  return (
    <View style={ui.between}>
      <View style={[ui.row, ui.flex]}>
        {icon && <Icon name={icon} color={colors.teal} size={20} />}
        <Text style={[ui.heading, { flexShrink: 1 }]}>{title}</Text>
      </View>
      {aside && <Text style={ui.label}>{aside}</Text>}
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
