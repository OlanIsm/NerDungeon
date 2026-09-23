import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, type IconName } from "./GameUI";
import { fonts } from "../theme";
export const realm = {
  ink: "#43291b",
  muted: "#705039",
  gold: "#825018",
  edge: "#967047",
  dark: "#211c19",
  panel: "#fff0cb",
};
export function RealmFrame({ children }: PropsWithChildren) {
  return (
    <View style={f.frame}>
      <LinearGradient
        colors={["#fff6db", "#efd5a0"]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={f.inner} />
      {children}
      {[f.tl, f.tr, f.bl, f.br].map((position, i) => (
        <View pointerEvents="none" key={i} style={[f.rivet, position]} />
      ))}
    </View>
  );
}
export function RealmButton({
  label,
  onPress,
  icon = "chevron-right",
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        f.button,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      ]}
    >
      <LinearGradient colors={["#ffe09a", "#e7a83f"]} style={f.buttonFill}>
        <Icon name={icon} color="#362415" size={22} />
        <Text style={f.buttonText}>{label}</Text>
        <View style={f.stud} />
      </LinearGradient>
    </Pressable>
  );
}
export const fantasy = StyleSheet.create({
  title: {
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 33,
    color: realm.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: realm.muted,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 11,
    lineHeight: 17,
    color: realm.gold,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: realm.edge,
    opacity: 0.6,
    marginVertical: 12,
  },
});
const f = StyleSheet.create({
  frame: {
    borderWidth: 2,
    borderColor: realm.edge,
    borderRadius: 12,
    padding: 20,
    gap: 12,
    overflow: "hidden",
  },
  inner: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderWidth: 1,
    borderColor: "#70553b",
    borderRadius: 7,
  },
  rivet: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: realm.gold,
  },
  tl: { top: 9, left: 9 },
  tr: { top: 9, right: 9 },
  bl: { bottom: 9, left: 9 },
  br: { bottom: 9, right: 9 },
  button: {
    borderWidth: 2,
    borderColor: "#684725",
    borderBottomWidth: 5,
    borderRadius: 9,
    overflow: "hidden",
  },
  buttonFill: {
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#f6dfaa",
    borderRadius: 6,
  },
  buttonText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: "#362415",
    flexShrink: 1,
  },
  stud: {
    width: 5,
    height: 5,
    backgroundColor: "#74502b",
    transform: [{ rotate: "45deg" }],
  },
});
