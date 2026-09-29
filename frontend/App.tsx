import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  Modal,
  ScrollView,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Rubik_700Bold } from "@expo-google-fonts/rubik/700Bold";
import { Rubik_900Black } from "@expo-google-fonts/rubik/900Black";
import { Epilogue_500Medium } from "@expo-google-fonts/epilogue/500Medium";
import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk/700Bold";
import { art, icons } from "./src/assets";
import { Button, useReducedMotion } from "./src/components/GameUI";
import { BottomNavItem } from "./src/components/BottomNavItem";
import { PlayerHeader } from "./src/components/PlayerHeader";
import { HomeScreen } from "./src/screens/HomeScreen";
import {
  AdventureScreen,
  RegionDetailScreen,
  RegionScreen,
  expeditions,
  type Expedition,
  type Region,
} from "./src/screens/AdventureScreen";
import { GachaScreen } from "./src/screens/GachaScreen";
import { InventoryScreen } from "./src/screens/InventoryScreen";
import { BattleScreen } from "./src/screens/BattleScreen";
import { colors, ui } from "./src/theme";
import type { Screen } from "./src/types";

const navigation = [
  { screen: "Hub", icon: icons.hub, size: 52, iconOffsetX: 4 },
  { screen: "Expedition", icon: icons.map, size: 51, iconOffsetX: 1 },
  { screen: "Bazaar", icon: icons.bazaar, size: 56, iconOffsetX: -1 },
  { screen: "Bag", icon: icons.armory, size: 57, iconOffsetX: -4 },
] as const;

const shellAssets = [
  icons.hub,
  icons.map,
  icons.bazaar,
  icons.armory,
  icons.coins,
  icons.gems,
  art.character,
  art.nerdiusTitle,
];

export default function App() {
  const reducedMotion = useReducedMotion();
  const [loaded, error] = useFonts({
    Rubik_700Bold,
    Rubik_900Black,
    Epilogue_500Medium,
    SpaceGrotesk_700Bold,
  });
  const [loadedShellAssets, setLoadedShellAssets] = useState(
    () => new Set<number>(),
  );
  const [introDone, setIntroDone] = useState(false);
  const [introExit] = useState(() => new Animated.Value(0));
  const { height } = useWindowDimensions();
  const ready =
    (loaded || !!error) && loadedShellAssets.size === shellAssets.length;
  const progress =
    (loadedShellAssets.size + (loaded || error ? 1 : 0)) /
    (shellAssets.length + 1);

  useEffect(() => {
    if (!ready) return;
    Animated.timing(introExit, {
      toValue: 1,
      duration: reducedMotion ? 0 : 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setIntroDone(true));
  }, [introExit, ready, reducedMotion]);

  return (
    <SafeAreaProvider>
      <View style={s.root}>
        {ready && <GameApp />}
        {!introDone && (
          <Animated.View
            accessibilityLabel="Loading Nerdius"
            accessibilityLiveRegion="polite"
            style={[
              s.introLoading,
              {
                transform: [
                  {
                    translateY: introExit.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -height],
                    }),
                  },
                ],
              },
            ]}
          >
            {shellAssets.map((source, index) => (
              <Image
                key={index}
                source={source}
                style={s.shellAsset}
                onLoadEnd={() =>
                  setLoadedShellAssets((current) =>
                    current.has(index) ? current : new Set(current).add(index),
                  )
                }
              />
            ))}
            <Image
              source={art.character}
              resizeMode="contain"
              style={s.introNerd}
            />
            <Image
              source={art.nerdiusTitle}
              resizeMode="contain"
              style={s.introTitle}
            />
            <View style={s.introTrack}>
              <View style={[s.introFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={s.introText}>
              Opening the dungeon... {Math.round(progress * 100)}%
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}
function GameApp() {
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const [screen, setScreen] = useState<Screen>("Hub");
  const [message, setMessage] = useState<string>();
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition>(
    expeditions[0],
  );
  const [selectedRegion, setSelectedRegion] = useState<Region>(
    expeditions[0].regions[0],
  );
  const [lastAdventure, setLastAdventure] = useState({
    expedition: expeditions[0],
    region: expeditions[0].regions[1],
  });
  const [visited, setVisited] = useState(() => new Set<Screen>(["Hub"]));
  const scrolls = useRef<Partial<Record<Screen, ScrollView | null>>>({});
  const [pageReveal] = useState(() => new Animated.Value(1));
  const [entryOffset, setEntryOffset] = useState(0);
  const navigate = useCallback(
    (next: Screen) => {
      setEntryOffset(
        next === "Hub" || next === "Region"
          ? -26
          : next === "Bazaar" || next === "RegionDetail"
            ? 0
            : 26,
      );
      pageReveal.setValue(reducedMotion ? 1 : 0);
      setVisited((current) =>
        current.has(next) ? current : new Set(current).add(next),
      );
      setScreen(next);
      scrolls.current[next]?.scrollTo({ y: 0, animated: false });
      Animated.timing(pageReveal, {
        toValue: 1,
        duration: reducedMotion ? 0 : 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [pageReveal, reducedMotion],
  );
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (message) {
        setMessage(undefined);
        return true;
      }
      if (screen !== "Hub") {
        navigate(
          screen === "Battle"
            ? "RegionDetail"
            : screen === "RegionDetail"
              ? "Region"
              : screen === "Region"
                ? "Expedition"
                : "Hub",
        );
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [screen, message, navigate]);
  const props = { navigate, notify: setMessage };
  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={s.environmentLeft} />
      <View pointerEvents="none" style={s.environmentRight} />
      <View style={[s.app, width >= 700 && s.desktopApp]}>
        {!(["Region", "RegionDetail", "Battle"] as Screen[]).includes(
          screen,
        ) && (
          <PlayerHeader
            onPressProfile={() =>
              setMessage(
                "Nerd Mage · Level 5 Scholar. UI preview — data demonstrasi lokal.",
              )
            }
          />
        )}
        <Animated.View
          style={[
            s.pages,
            {
              opacity: pageReveal,
              transform: [
                {
                  translateX: pageReveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [entryOffset, 0],
                  }),
                },
                {
                  scale: pageReveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {visited.has("Bag") && (
            <View style={[s.fixedContent, screen !== "Bag" && s.hidden]}>
              <InventoryScreen {...props} />
            </View>
          )}
          {visited.has("Hub") && (
            <ScrollView
              ref={(node) => {
                scrolls.current.Hub = node;
              }}
              style={[s.content, screen !== "Hub" && s.hidden]}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <HomeScreen
                {...props}
                lastAdventure={lastAdventure}
                onContinue={() => {
                  setSelectedExpedition(lastAdventure.expedition);
                  setSelectedRegion(lastAdventure.region);
                  navigate("RegionDetail");
                }}
                onSelectExpedition={(expedition) => {
                  setSelectedExpedition(expedition);
                  setSelectedRegion(expedition.regions[0]);
                  navigate("Region");
                }}
              />
            </ScrollView>
          )}
          {visited.has("Expedition") && (
            <ScrollView
              ref={(node) => {
                scrolls.current.Expedition = node;
              }}
              style={[s.content, screen !== "Expedition" && s.hidden]}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <AdventureScreen
                onInspect={() =>
                  requestAnimationFrame(() =>
                    scrolls.current.Expedition?.scrollToEnd({
                      animated: !reducedMotion,
                    }),
                  )
                }
                onSelect={(expedition, region) => {
                  setSelectedExpedition(expedition);
                  setSelectedRegion(region ?? expedition.regions[0]);
                  navigate(region ? "RegionDetail" : "Region");
                }}
              />
            </ScrollView>
          )}
          {visited.has("Bazaar") && (
            <ScrollView
              ref={(node) => {
                scrolls.current.Bazaar = node;
              }}
              style={[s.content, screen !== "Bazaar" && s.hidden]}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <GachaScreen {...props} />
            </ScrollView>
          )}
          {screen === "Region" && (
            <RegionScreen
              expedition={selectedExpedition}
              onBack={() => navigate("Expedition")}
              onSelect={(region) => {
                setSelectedRegion(region);
                navigate("RegionDetail");
              }}
            />
          )}
          {screen === "RegionDetail" && (
            <RegionDetailScreen
              expedition={selectedExpedition}
              region={selectedRegion}
              onBack={() => navigate("Region")}
              onStart={() => {
                setLastAdventure({
                  expedition: selectedExpedition,
                  region: selectedRegion,
                });
                navigate("Battle");
              }}
            />
          )}
          {screen === "Battle" && <BattleScreen {...props} />}
        </Animated.View>
        {!(["Region", "RegionDetail", "Battle"] as Screen[]).includes(
          screen,
        ) && (
          <View
            accessibilityRole="tablist"
            accessibilityLabel="Main navigation"
            style={s.nav}
          >
            {navigation.map((item) => (
              <BottomNavItem
                key={item.screen}
                screen={item.screen}
                icon={item.icon}
                size={item.size}
                iconOffsetX={item.iconOffsetX}
                selected={screen === item.screen}
                onPress={() => navigate(item.screen)}
              />
            ))}
          </View>
        )}
        <Modal
          visible={!!message}
          transparent
          animationType={reducedMotion ? "none" : "fade"}
          onRequestClose={() => setMessage(undefined)}
        >
          <View style={s.overlay}>
            <View
              accessibilityViewIsModal
              style={[ui.panel, { width: "100%", maxWidth: 370, padding: 22 }]}
            >
              <Text style={ui.heading}>Adventurer’s Journal</Text>
              <Text style={ui.body}>{message}</Text>
              <Button
                label="Continue"
                tone="gold"
                onPress={() => setMessage(undefined)}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1, backgroundColor: "#dce3ce", overflow: "hidden" },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  desktopApp: {
    marginVertical: 20,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#b1bda0",
    shadowColor: colors.edge,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  environmentLeft: {
    position: "absolute",
    width: 620,
    height: 620,
    borderRadius: 310,
    backgroundColor: "#cdd9bc",
    left: -240,
    bottom: -200,
    transform: [{ scaleX: 1.5 }],
  },
  environmentRight: {
    position: "absolute",
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: "#e8e9d6",
    right: -160,
    top: -140,
  },
  introLoading: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  introNerd: { width: 230, height: 230 },
  introTitle: { width: "100%", maxWidth: 320, height: 150, marginTop: -52 },
  introTrack: {
    width: "82%",
    maxWidth: 330,
    height: 18,
    padding: 3,
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#7b481c",
    backgroundColor: "#f8df9a",
  },
  introFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#f4b927",
  },
  introText: {
    marginTop: 12,
    fontFamily: "Rubik_700Bold",
    fontSize: 13,
    color: colors.wood,
  },
  shellAsset: { position: "absolute", width: 1, height: 1, opacity: 0 },
  pages: { flex: 1 },
  content: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { padding: 16, paddingTop: 14, paddingBottom: 28 },
  fixedContent: { flex: 1 },
  hidden: { display: "none" },
  nav: {
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 84,
    paddingTop: 5,
    paddingBottom: 6,
    paddingHorizontal: 8,
    gap: 4,
    borderTopWidth: 3,
    borderTopColor: colors.edge,
    backgroundColor: colors.wood,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#221b0599",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
