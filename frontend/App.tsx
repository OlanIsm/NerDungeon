import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  ImageBackground,
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
import { art, gui, icons, mapArt } from "./src/assets";
import { Button } from "./src/components/GameUI";
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
  gui.background,
  gui.header,
  gui.navbar,
  icons.hub,
  icons.map,
  icons.bazaar,
  icons.armory,
  icons.coins,
  icons.gems,
  icons.exp,
  art.nerdLoading,
  art.nerdiusTitle,
  mapArt.background,
  mapArt.desert,
  mapArt.volcano,
  mapArt.kingdom,
];

export default function App() {
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
      duration: 420,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setIntroDone(true));
  }, [introExit, ready]);

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
              source={art.nerdLoading}
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
  const [screen, setScreen] = useState<Screen>("Hub");
  const [message, setMessage] = useState<string>();
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition>(
    expeditions[0],
  );
  const [selectedRegion, setSelectedRegion] = useState<Region>(
    expeditions[0].regions[0],
  );
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
      pageReveal.setValue(0);
      setVisited((current) =>
        current.has(next) ? current : new Set(current).add(next),
      );
      setScreen(next);
      scrolls.current[next]?.scrollTo({ y: 0, animated: false });
      Animated.timing(pageReveal, {
        toValue: 1,
        duration: 210,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [pageReveal],
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
      <StatusBar style="light" />
      <View style={s.app}>
        <ImageBackground
          accessibilityIgnoresInvertColors
          source={gui.background}
          resizeMode="cover"
          style={s.appBackground}
        />
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
              <HomeScreen {...props} />
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
                onSelect={(expedition) => {
                  setSelectedExpedition(expedition);
                  setSelectedRegion(expedition.regions[0]);
                  navigate("Region");
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
              onStart={() => navigate("Battle")}
            />
          )}
          {screen === "Battle" && <BattleScreen {...props} />}
        </Animated.View>
        {!(["Region", "RegionDetail", "Battle"] as Screen[]).includes(
          screen,
        ) && (
          <View style={s.nav}>
            <Image
              accessibilityIgnoresInvertColors
              source={gui.navbar}
              resizeMode="contain"
              style={s.navBackground}
            />
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
          animationType="fade"
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
  root: { flex: 1, backgroundColor: "#10284e" },
  safe: { flex: 1, backgroundColor: "#e8d9b6" },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    overflow: "visible",
    backgroundColor: colors.background,
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
    backgroundColor: "#10284e",
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
    color: "#fff1c7",
  },
  shellAsset: { position: "absolute", width: 1, height: 1, opacity: 0 },
  appBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  pages: { flex: 1 },
  content: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { padding: 12, paddingTop: 118, paddingBottom: 124 },
  fixedContent: { flex: 1, paddingTop: 108 },
  hidden: { display: "none" },
  nav: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    height: 96,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  navBackground: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    aspectRatio: 1200 / 289,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#221b0599",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
