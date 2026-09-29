import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { art, icons } from "../assets";
import { colors, fonts } from "../theme";

function Resource({ kind, label }: { kind: "coins" | "gems"; label: string }) {
  return (
    <View
      accessibilityLabel={label + (kind === "coins" ? " Gold" : " Gems")}
      style={s.resource}
    >
      <Image
        source={icons[kind]}
        resizeMode="contain"
        style={s.resourceImage}
      />
      <Text style={s.resourceValue}>{label}</Text>
    </View>
  );
}

export function PlayerHeader({
  onPressProfile,
}: {
  onPressProfile: () => void;
}) {
  return (
    <View style={s.header}>
      <View pointerEvents="none" style={s.highlight} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open player profile"
        onPress={onPressProfile}
        style={({ pressed }) => [
          s.portrait,
          pressed && { transform: [{ translateY: 1 }] },
        ]}
      >
        <Image
          source={art.character}
          resizeMode="contain"
          style={s.character}
        />
        <View style={s.level}>
          <Text style={s.levelText}>Lv. 5</Text>
        </View>
      </Pressable>
      <View style={s.player}>
        <Text numberOfLines={1} style={s.name}>
          Nerd Mage
        </Text>
        <Text style={s.rank}>Scholar · 1,771 XP</Text>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Player experience"
          accessibilityValue={{ min: 0, max: 2000, now: 1250 }}
          style={s.track}
        >
          <View style={s.fill} />
        </View>
      </View>
      <View style={s.resources}>
        <Resource kind="coins" label="1,450" />
        <Resource kind="gems" label="320" />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 94,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    padding: 10,
    backgroundColor: colors.parchment,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.edge,
    borderRadius: 22,
    borderBottomLeftRadius: 14,
  },
  highlight: {
    position: "absolute",
    top: 3,
    left: 18,
    right: 18,
    height: 3,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  portrait: {
    width: 54,
    height: 62,
    backgroundColor: colors.sage,
    borderWidth: 2,
    borderColor: colors.edge,
    borderRadius: 15,
    alignItems: "center",
  },
  character: { width: 52, height: 52 },
  level: {
    position: "absolute",
    bottom: -4,
    borderWidth: 1,
    borderColor: colors.edge,
    borderRadius: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  levelText: { fontFamily: fonts.heading, fontSize: 11, color: colors.ink },
  player: { flex: 1, minWidth: 0, gap: 5 },
  name: { fontFamily: fonts.heading, fontSize: 16, color: colors.ink },
  rank: { fontFamily: fonts.label, fontSize: 11, color: colors.muted },
  track: {
    height: 8,
    padding: 1,
    backgroundColor: colors.inset,
    borderWidth: 1,
    borderColor: "#ac9978",
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    width: "62.5%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.teal,
  },
  resources: { gap: 5 },
  resource: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minWidth: 77,
    borderWidth: 1,
    borderColor: "#baa47d",
    backgroundColor: "#f5e8c6",
    borderRadius: 20,
    paddingRight: 8,
  },
  resourceImage: { width: 25, height: 25 },
  resourceValue: { fontFamily: fonts.heading, fontSize: 12, color: colors.ink },
});
