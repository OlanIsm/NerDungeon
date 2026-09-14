import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Rubik_700Bold } from "@expo-google-fonts/rubik/700Bold";
import { Rubik_900Black } from "@expo-google-fonts/rubik/900Black";
import { Epilogue_500Medium } from "@expo-google-fonts/epilogue/500Medium";
import { SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk/700Bold";
import { gui, icons } from "./src/assets";
import { Button } from "./src/components/GameUI";
import { BottomNavItem } from "./src/components/BottomNavItem";
import { PlayerHeader } from "./src/components/PlayerHeader";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AdventureScreen } from "./src/screens/AdventureScreen";
import { GachaScreen } from "./src/screens/GachaScreen";
import { InventoryScreen } from "./src/screens/InventoryScreen";
import { BattleScreen } from "./src/screens/BattleScreen";
import { colors, ui } from "./src/theme";
import type { Screen } from "./src/types";

const navigation = [
  { screen: "Hub", icon: icons.hub, size: 52, iconOffsetX: 4 },
  { screen: "Map", icon: icons.map, size: 51, iconOffsetX: 1 },
  { screen: "Bazaar", icon: icons.bazaar, size: 56, iconOffsetX: -1 },
  { screen: "Armory", icon: icons.armory, size: 57, iconOffsetX: -4 },
] as const;
export default function App() {
  const [loaded, error] = useFonts({
    Rubik_700Bold,
    Rubik_900Black,
    Epilogue_500Medium,
    SpaceGrotesk_700Bold,
  });
  return (
    <SafeAreaProvider>
      {!loaded && !error ? (
        <View style={[s.loading, ui.center]}>
          <ActivityIndicator color={colors.wood} />
          <Text>Opening the dungeon…</Text>
        </View>
      ) : (
        <GameApp />
      )}
    </SafeAreaProvider>
  );
}
function GameApp() {
  const [screen, setScreen] = useState<Screen>("Hub");
  const [message, setMessage] = useState<string>();
  const scroll = useRef<ScrollView>(null);
  function navigate(next: Screen) {
    setScreen(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (message) {
        setMessage(undefined);
        return true;
      }
      if (screen !== "Hub") {
        navigate(screen === "Battle" ? "Map" : "Hub");
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [screen, message]);
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
        <PlayerHeader
          onPressProfile={() =>
            setMessage(
              "Nerd Mage · Level 5 Scholar. UI preview — data demonstrasi lokal.",
            )
          }
        />
        <ScrollView
          ref={scroll}
          style={s.content}
          contentContainerStyle={{
            padding: 12,
            paddingTop: 120,
            paddingBottom: 124,
          }}
          showsVerticalScrollIndicator={false}
        >
          {screen === "Hub" && <HomeScreen {...props} />}
          {screen === "Map" && <AdventureScreen {...props} />}
          {screen === "Bazaar" && <GachaScreen {...props} />}
          {screen === "Armory" && <InventoryScreen {...props} />}
          {screen === "Battle" && <BattleScreen {...props} />}
        </ScrollView>
        {screen !== "Battle" && (
          <View style={s.nav}>
            <Image
              accessibilityIgnoresInvertColors
              source={gui.navbar}
              resizeMode="cover"
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
  safe: { flex: 1, backgroundColor: "#e8d9b6" },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  loading: { flex: 1, backgroundColor: colors.background, gap: 16 },
  appBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  content: { flex: 1, backgroundColor: "transparent" },
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
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "#221b0599",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
