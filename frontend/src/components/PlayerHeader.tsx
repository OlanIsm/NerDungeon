import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { art, icons } from "../assets";
import { colors, fonts } from "../theme";

type ResourceProps = {
  label: string;
  image: number;
  compact: boolean;
  accent: string;
};

function Resource({ label, image, compact, accent }: ResourceProps) {
  const iconSize = compact ? 22 : 27;
  return (
    <View style={styles.resource}>
      <View
        style={[
          styles.resourceIcon,
          { backgroundColor: accent, width: compact ? "44%" : "49%" },
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          source={image}
          resizeMode="contain"
          style={{ width: iconSize, height: iconSize }}
        />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[styles.resourceValue, compact && { fontSize: 9 }]}
      >
        {label}
      </Text>
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
    <View style={[styles.header, { minHeight: compact ? 88 : 98 }]}>
      <View style={styles.identityPlate} />
      <View style={styles.identityCut} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open player profile"
        onPress={onPressProfile}
        style={[
          styles.portraitFrame,
          {
            width: portraitSize,
            height: portraitSize,
            borderRadius: compact ? 14 : 17,
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
              width: portraitSize - 6,
              height: portraitSize - 6,
              borderRadius: compact ? 11 : 14,
            },
          ]}
        />
      </Pressable>

      <View style={styles.player}>
        <View style={styles.namePlate}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.playerName}
          >
            NERD MAGE
          </Text>
        </View>
        <View style={styles.experience}>
          <Image
            accessibilityIgnoresInvertColors
            source={icons.exp}
            resizeMode="contain"
            style={{ width: compact ? 23 : 27, height: compact ? 23 : 27 }}
          />
          <View style={styles.expBody}>
            <View style={styles.expLabels}>
              <Text style={styles.expLabel}>LV. 5</Text>
              {!compact && (
                <Text style={styles.expValue}>1,250 / 2,000 XP</Text>
              )}
            </View>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 2000, now: 1250 }}
              style={styles.expTrack}
            >
              <View style={styles.expFill} />
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.wallet, { width: compact ? 128 : 144 }]}>
        <Resource
          label="1,450"
          image={icons.coins}
          compact={compact}
          accent={colors.gold}
        />
        <Resource
          label="320"
          image={icons.gems}
          compact={compact}
          accent={colors.teal}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#2e1500",
    borderBottomWidth: 3,
    borderBottomColor: "#1d0d00",
  },
  identityPlate: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: "39%",
    backgroundColor: "#4a260e",
  },
  identityCut: {
    position: "absolute",
    width: 34,
    height: 110,
    right: "35%",
    bottom: -37,
    backgroundColor: "#4a260e",
    transform: [{ rotate: "31deg" }],
  },
  portraitFrame: {
    padding: 3,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: "#ffd86a",
    shadowColor: "#130700",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
    elevation: 4,
  },
  portrait: { backgroundColor: colors.wood },
  player: { flex: 1, minWidth: 0, gap: 6 },
  namePlate: {
    alignSelf: "stretch",
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 9,
    backgroundColor: colors.woodLight,
    borderRadius: 4,
    borderBottomWidth: 3,
    borderBottomColor: colors.edge,
  },
  playerName: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: "#fff2d9",
    letterSpacing: 0.5,
  },
  experience: { flexDirection: "row", alignItems: "center", gap: 5 },
  expBody: { flex: 1, gap: 3 },
  expLabels: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  expLabel: { fontFamily: fonts.label, fontSize: 9, color: "#ffe08a" },
  expValue: { fontFamily: fonts.label, fontSize: 8, color: "#fcedc9" },
  expTrack: {
    height: 7,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "#211006",
    borderWidth: 1,
    borderColor: "#120700",
  },
  expFill: {
    width: "62.5%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  wallet: { flexDirection: "row", alignItems: "stretch", gap: 5 },
  resource: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#211006",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#120700",
  },
  resourceIcon: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  resourceValue: {
    flex: 1,
    paddingHorizontal: 3,
    fontFamily: fonts.label,
    fontSize: 10,
    color: "#fff2d9",
    textAlign: "center",
  },
});
