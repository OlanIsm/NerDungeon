import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  Modal,
  Pressable,
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
import { icons } from "./src/assets";
import { Button } from "./src/components/GameUI";
import { PlayerHeader } from "./src/components/PlayerHeader";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AdventureScreen } from "./src/screens/AdventureScreen";
import { GachaScreen } from "./src/screens/GachaScreen";
import { InventoryScreen } from "./src/screens/InventoryScreen";
import { BattleScreen } from "./src/screens/BattleScreen";
import { colors, ui } from "./src/theme";
import type { Screen } from "./src/types";

const navigation = [
  { screen: "Hub", icon: icons.hub, size: 35 },
  { screen: "Map", icon: icons.map, size: 34 },
  { screen: "Bazaar", icon: icons.bazaar, size: 37 },
  { screen: "Armory", icon: icons.armory, size: 38 },
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
        <PlayerHeader
          onPressProfile={() =>
            setMessage(
              "Nerd Mage · Level 5 Scholar. UI preview — data demonstrasi lokal.",
            )
          }
        />
        <ScrollView
          ref={scroll}
          contentContainerStyle={{ padding: 12, paddingBottom: 28 }}
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
            {navigation.map((item) => (
              <Pressable
                key={item.screen}
                accessibilityRole="tab"
                accessibilityLabel={item.screen}
                accessibilityState={{ selected: screen === item.screen }}
                onPress={() => navigate(item.screen)}
                style={[
                  s.navItem,
                  screen === item.screen && { backgroundColor: colors.wood },
                ]}
              >
                <Image
                  accessibilityIgnoresInvertColors
                  source={item.icon}
                  resizeMode="contain"
                  style={{
                    width: item.size,
                    height: item.size,
                    transform: [
                      { scale: screen === item.screen ? 1.06 : 0.94 },
                    ],
                  }}
                />
                <Text
                  style={[
                    ui.label,
                    { color: screen === item.screen ? "#fff2d9" : colors.wood },
                  ]}
                >
                  {item.screen}
                </Text>
              </Pressable>
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
              <Button label="Continue" onPress={() => setMessage(undefined)} />
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
    backgroundColor: colors.background,
  },
  loading: { flex: 1, backgroundColor: colors.background, gap: 16 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff2d9",
    borderTopWidth: 1,
    borderTopColor: "#e8d9b6",
  },
  navItem: {
    minWidth: 62,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#221b0599",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
