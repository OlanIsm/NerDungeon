import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { gui, icons } from "../assets";
import { Icon } from "./GameUI";
import { colors, fonts } from "../theme";

type ResourceKind = "coins" | "gems";

const resourceImages = { coins: icons.coins, gems: icons.gems } as const;

function Resource({ kind, label }: { kind: ResourceKind; label: string }) {
  return (
    <View style={styles.resource}>
      <View style={styles.resourceIcon}>
        <Image
          accessibilityIgnoresInvertColors
          source={resourceImages[kind]}
          resizeMode="contain"
          style={styles.resourceImage}
        />
      </View>
      <View style={styles.resourcePill}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={styles.resourceValue}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

export function PlayerHeader({
  onPressProfile,
}: {
  onPressProfile: () => void;
}) {
  const portraitSize = 50;
  return (
    <View pointerEvents="box-none" style={styles.header}>
      <View pointerEvents="none" style={styles.headerBackground}>
        <Image
          accessibilityIgnoresInvertColors
          source={gui.header}
          resizeMode="contain"
          style={styles.headerBackgroundImage}
        />
      </View>
      <View pointerEvents="box-none" style={styles.headerContent}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open player profile"
          onPress={onPressProfile}
          style={[
            styles.portraitFrame,
            {
              width: portraitSize,
              height: portraitSize,
              borderRadius: 12,
            },
          ]}
        >
          <Icon name="account" size={portraitSize - 16} color="#fff1ce" />
        </Pressable>
        <View pointerEvents="none" style={styles.playerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.level}>5</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={styles.playerName}
            >
              NERD MAGE
            </Text>
          </View>
          <View style={styles.rankRow}>
            <Image
              accessibilityIgnoresInvertColors
              source={icons.exp}
              resizeMode="contain"
              style={{ width: 17, height: 17 }}
            />
            <Text style={styles.rank}>1,771</Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 2000, now: 1250 }}
            style={[styles.expTrack, { width: 72 }]}
          >
            <View style={styles.expFill} />
          </View>
        </View>
        <View pointerEvents="none" style={styles.resources}>
          <Resource kind="coins" label="1,450" />
          <Resource kind="gems" label="320" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: -8,
    right: 0,
    left: 0,
    zIndex: 20,
    height: 133,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  headerBackground: {
    position: "absolute",
    width: "100%",
    maxWidth: 378,
    aspectRatio: 2117 / 743,
  },
  headerBackgroundImage: { width: "100%", height: "100%" },
  headerContent: {
    width: "83%",
    maxWidth: 342,
    height: 70,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  portraitFrame: {
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b86f16",
    borderWidth: 2,
    borderColor: "#f6d98f",
    shadowColor: "#120703",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 2,
    elevation: 5,
  },
  playerInfo: {
    flex: 1.12,
    minWidth: 0,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  level: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.gold,
    textShadowColor: "#120703",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1,
  },
  playerName: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 11,
    color: "#fff7e4",
    letterSpacing: 0.5,
  },
  expTrack: {
    height: 6,
    marginLeft: 22,
    marginTop: -1,
    maxWidth: "78%",
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "#120905",
    borderWidth: 1,
    borderColor: "#0b0402",
  },
  expFill: {
    width: "62.5%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#75d9e5",
  },
  rankRow: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rank: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: colors.gold,
    textShadowColor: "#120703",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  resources: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resource: {
    position: "relative",
    width: 70,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  resourceIcon: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  resourceImage: { width: 36, height: 36 },
  resourcePill: {
    position: "absolute",
    left: 18,
    right: 0,
    height: 27,
    paddingLeft: 13,
    paddingRight: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4b2814",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#321709",
  },
  resourceValue: {
    fontFamily: fonts.heavy,
    fontSize: 10,
    letterSpacing: -0.2,
    color: "#fff7e4",
    textAlign: "center",
  },
});
