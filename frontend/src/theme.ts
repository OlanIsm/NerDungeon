import { StyleSheet } from "react-native";

export const colors = {
  background: "#fff8f1",
  parchment: "#fcedc9",
  inset: "#f1e1be",
  ink: "#221b05",
  muted: "#51443a",
  wood: "#6f4315",
  woodLight: "#8b5a2b",
  edge: "#5c3a21",
  gold: "#ffba20",
  teal: "#006a62",
  mint: "#98f3e7",
  white: "#ffffff",
  red: "#ba1a1a",
};
export const fonts = {
  heading: "Rubik_700Bold",
  heavy: "Rubik_900Black",
  body: "Epilogue_500Medium",
  label: "SpaceGrotesk_700Bold",
};
export const ui = StyleSheet.create({
  column: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  panel: {
    backgroundColor: colors.parchment,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderBottomWidth: 4,
    borderBottomColor: colors.edge,
  },
  inset: {
    backgroundColor: colors.inset,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.wood,
    lineHeight: 27,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 22,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  hero: {
    fontFamily: fonts.heavy,
    fontSize: 24,
    lineHeight: 29,
    color: colors.wood,
  },
});
