import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { art, gui, icons } from "../assets";
import { colors, fonts } from "../theme";

type ResourceKind = "coins" | "gems";

const resourceImages = { coins: icons.coins, gems: icons.gems } as const;

function Resource({
  kind,
  label,
  compact,
}: {
  kind: ResourceKind;
  label: string;
  compact: boolean;
}) {
  const iconSize = compact ? 23 : 28;
  return (
    <View
      style={[
        styles.resource,
        {
          width: kind === "coins" ? (compact ? 60 : 64) : compact ? 52 : 56,
        },
      ]}
    >
      <View style={[styles.resourceIcon, { width: compact ? 23 : 28 }]}>
        <Image
          accessibilityIgnoresInvertColors
          source={resourceImages[kind]}
          resizeMode="contain"
          style={{ width: iconSize, height: iconSize }}
        />
      </View>
      <View style={styles.resourcePill}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={[styles.resourceValue, compact && styles.resourceValueCompact]}
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
  const { width } = useWindowDimensions();
  const compact = width <= 350;
  const portraitSize = compact ? 50 : 60;
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <Image
        accessibilityIgnoresInvertColors
        source={gui.woodenRectangle}
        resizeMode="stretch"
        style={[
          styles.woodenBackground,
          compact && styles.woodenBackgroundCompact,
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open player profile"
        onPress={onPressProfile}
        style={[
          styles.portraitFrame,
          {
            width: portraitSize,
            height: portraitSize,
            borderRadius: compact ? 12 : 15,
          },
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          source={art.avatar}
          resizeMode="cover"
          style={[
            styles.portrait,
            {
              width: portraitSize - 10,
              height: portraitSize - 10,
              borderRadius: compact ? 9 : 12,
            },
          ]}
        />
      </Pressable>
      <View style={styles.playerInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.level, compact && styles.levelCompact]}>5</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            style={[styles.playerName, compact && styles.playerNameCompact]}
          >
            NERD MAGE
          </Text>
        </View>
        <View style={styles.rankRow}>
          <Image
            accessibilityIgnoresInvertColors
            source={icons.exp}
            resizeMode="contain"
            style={{ width: compact ? 17 : 20, height: compact ? 17 : 20 }}
          />
          <Text style={[styles.rank, compact && styles.rankCompact]}>
            1,771
          </Text>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 2000, now: 1250 }}
          style={[styles.expTrack, { width: compact ? 72 : 104 }]}
        >
          <View style={styles.expFill} />
        </View>
      </View>
      <View style={styles.resources}>
        <Resource kind="coins" label="1,450" compact={compact} />
        <Resource kind="gems" label="320" compact={compact} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    minHeight: 82,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "transparent",
  },
  headerCompact: {
    minHeight: 74,
    paddingHorizontal: 6,
    paddingVertical: 7,
    gap: 4,
  },
  woodenBackground: {
    position: "absolute",
    top: -22,
    left: "-4%",
    width: "108%",
    height: 128,
  },
  woodenBackgroundCompact: { top: -20, height: 116 },
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
  portrait: {
    backgroundColor: colors.wood,
    borderWidth: 1,
    borderColor: "#6d390f",
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
    fontSize: 18,
    color: colors.gold,
    textShadowColor: "#120703",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1,
  },
  levelCompact: { fontSize: 14 },
  playerName: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 13,
    color: "#fff7e4",
    letterSpacing: 0.5,
  },
  playerNameCompact: { fontSize: 11 },
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
    fontSize: 15,
    color: colors.gold,
    textShadowColor: "#120703",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  rankCompact: { fontSize: 12 },
  resources: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resource: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
  },
  resourceIcon: {
    position: "relative",
    zIndex: 2,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  resourcePill: {
    flex: 1,
    height: 34,
    marginLeft: -8,
    paddingLeft: 6,
    paddingRight: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#160b06",
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#0b0402",
  },
  resourceValue: {
    fontFamily: fonts.heavy,
    fontSize: 10,
    letterSpacing: -0.2,
    color: "#fff7e4",
    textAlign: "center",
  },
  resourceValueCompact: { fontSize: 9 },
});
