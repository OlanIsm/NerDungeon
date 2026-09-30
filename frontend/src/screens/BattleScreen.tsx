import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { art } from "../assets";
import { Button, Icon, useReducedMotion } from "../components/GameUI";
import { DebugControls } from "../game/DebugControls";
import { FantasyScene } from "../game/FantasyScene";
import { WORLD } from "../game/level";
import { fightAssets } from "../game/side/SideScene";
import { GameState, type GamePhase } from "../game/types";
import { useFantasyGame } from "../game/useFantasyGame";
import { fonts } from "../theme";
import type { ScreenProps } from "../types";

const status: Record<GamePhase, string> = {
  walking: "Walking east",
  encounterStarting: "Something stirs ahead…",
  encounter: "Forest encounter",
  encounterComplete: "Path cleared!",
  bossEncounter: "The grove guardian",
  result: "Trail complete!",
};

export function BattleScreen({
  navigate,
  onComplete,
}: ScreenProps & { onComplete: () => void }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [run, setRun] = useState(0);
  const [loadedAssets, setLoadedAssets] = useState(() => new Set<number>());
  const [doorAssets, setDoorAssets] = useState(() => new Set<number>());
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<"closing" | "loading" | "ready">(
    "closing",
  );
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [doors] = useState(() => new Animated.Value(0));
  const reducedMotion = useReducedMotion();
  const allLoaded = loadedAssets.size === fightAssets.length;
  const opening =
    phase === "loading" && allLoaded && minimumElapsed && !loadError;

  useEffect(() => {
    if (phase !== "closing" || doorAssets.size !== 2 || size.width === 0)
      return;
    const animation = Animated.timing(doors, {
      toValue: 1,
      duration: reducedMotion ? 0 : 650,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) setPhase("loading");
    });
    return () => animation.stop();
  }, [phase, doors, doorAssets.size, size.width, reducedMotion]);

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setMinimumElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, [phase, attempt]);

  useEffect(() => {
    if (phase !== "loading" || allLoaded || loadError) return;
    const timer = setTimeout(() => setLoadError(true), 20000);
    return () => clearTimeout(timer);
  }, [phase, allLoaded, loadError, attempt]);

  useEffect(() => {
    if (!opening) return;
    const animation = Animated.timing(doors, {
      toValue: 0,
      duration: reducedMotion ? 0 : 750,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) setPhase("ready");
    });
    return () => animation.stop();
  }, [opening, doors, reducedMotion]);

  return (
    <View
      style={[s.screen, { backgroundColor: "#17110c" }]}
      onLayout={({ nativeEvent: { layout } }) =>
        setSize((current) =>
          current.width === layout.width && current.height === layout.height
            ? current
            : { width: layout.width, height: layout.height },
        )
      }
    >
      {phase !== "closing" &&
        fightAssets.map((source, index) => (
          <Image
            key={`${attempt}-${index}`}
            source={source}
            style={s.preloadAsset}
            onLoad={() =>
              setLoadedAssets((current) =>
                current.has(index) ? current : new Set(current).add(index),
              )
            }
            onError={() => setLoadError(true)}
          />
        ))}
      {(opening || phase === "ready") && size.width > 0 && size.height > 0 && (
        <Journey
          key={run}
          width={size.width}
          height={size.height}
          active={phase === "ready"}
          exit={() => navigate("RegionDetail")}
          replay={() => setRun(run + 1)}
          onComplete={onComplete}
        />
      )}
      {phase !== "ready" && (
        <View
          testID={`gate-${opening ? "opening" : phase}`}
          accessibilityLabel="Loading adventure"
          accessibilityLiveRegion="polite"
          style={s.gate}
        >
          {[art.doorLeft, art.doorRight].map((source, index) => (
            <Animated.View
              key={`${attempt}-door-${index}`}
              style={[
                s.door,
                index === 0 ? { left: 0 } : { right: 0 },
                {
                  transform: [
                    {
                      translateX: doors.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          (index === 0 ? -1 : 1) * (size.width / 2 + 2),
                          0,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={source}
                resizeMode="stretch"
                style={s.doorImage}
                onLoad={() =>
                  setDoorAssets((current) =>
                    current.has(index) ? current : new Set(current).add(index),
                  )
                }
                onError={() => setLoadError(true)}
              />
            </Animated.View>
          ))}
          {loadError && (
            <View accessibilityLiveRegion="assertive" style={s.loadingActions}>
              <Text style={s.progressText}>Some assets failed to load.</Text>
              <Button
                label="Exit"
                tone="quiet"
                onPress={() => navigate("RegionDetail")}
              />
              <Button
                label="Retry"
                tone="gold"
                onPress={() => {
                  setLoadedAssets(new Set());
                  setDoorAssets(new Set());
                  setLoadError(false);
                  setMinimumElapsed(false);
                  setAttempt((value) => value + 1);
                }}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function Journey({
  width,
  height,
  exit,
  replay,
  onComplete,
  active,
}: {
  active: boolean;
  width: number;
  height: number;
  exit: () => void;
  replay: () => void;
  onComplete: () => void;
}) {
  const scale = width / WORLD.width;
  const { game, scrollX, act } = useFantasyGame(height / scale, scale, active);
  const recorded = useRef(false);
  useEffect(() => {
    if (game.state === GameState.result && !recorded.current) {
      recorded.current = true;
      onComplete();
    }
  }, [game.state, onComplete]);
  const [debug, setDebug] = useState(false);
  const [bounds, setBounds] = useState(false);
  const [triggers, setTriggers] = useState(false);
  const inEncounter =
    game.state === GameState.encounter ||
    game.state === GameState.bossEncounter;
  return (
    <View
      style={s.screen}
      testID="fight-page"
      pointerEvents={active ? "auto" : "none"}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? "auto" : "no-hide-descendants"}
    >
      <FantasyScene
        game={game}
        scale={scale}
        scrollX={scrollX}
        bounds={bounds}
        triggers={triggers}
      />
      <View style={s.header}>
        <Button label="Exit" onPress={exit} style={s.exit} />
        <View style={s.heading}>
          <Text style={s.title}>Sunlit Forest</Text>
          <Text style={s.subtitle}>The scholar’s trail</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Debug controls"
          accessibilityState={{ expanded: debug }}
          onPress={() => setDebug(!debug)}
          style={s.debugToggle}
        >
          <Icon name="tune-variant" size={22} color="#48643c" />
          <Text style={s.debugLabel}>Debug</Text>
        </Pressable>
      </View>
      {!debug && (
        <View pointerEvents="none" style={s.north}>
          <Icon name="arrow-right" size={18} color="#fff4c8" />
          <Text style={s.northText}>EAST</Text>
        </View>
      )}
      {debug && (
        <DebugControls
          game={game}
          act={act}
          bounds={bounds}
          triggers={triggers}
          setBounds={setBounds}
          setTriggers={setTriggers}
        />
      )}
      <View style={s.footer}>
        <View style={s.statusRow}>
          <View style={s.statusCopy}>
            <Text
              testID="fight-status"
              accessibilityLiveRegion="polite"
              style={s.statusTitle}
            >
              {game.paused ? "Journey paused" : status[game.state]}
            </Text>
            <Text style={s.description}>
              {inEncounter
                ? `${game.encounter?.name} · ${game.encounter?.count} ${game.encounter?.count === 1 ? "enemy" : "enemies"}`
                : game.state === GameState.result
                  ? "The forest is safe. A new trail awaits."
                  : game.state === GameState.encounterComplete
                    ? "The trail opens up again."
                    : "Follow the path toward the next clearing."}
            </Text>
          </View>
          <View style={s.cleared}>
            <Icon name="flag-checkered" size={19} color="#506837" />
            <Text style={s.clearedText}>{game.cleared} cleared</Text>
          </View>
        </View>
        {inEncounter && (
          <Button
            label="Complete Encounter"
            tone="gold"
            onPress={() => act(() => game.completeEncounter())}
          />
        )}
        {game.state === GameState.result && (
          <View style={s.resultActions}>
            <Button
              label="Continue trail"
              tone="gold"
              onPress={() => act(() => game.continueTrail())}
              style={s.grow}
            />
            <Button label="Replay" tone="quiet" onPress={replay} />
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, overflow: "hidden", backgroundColor: "#94c967" },
  gate: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    overflow: "hidden",
  },
  door: { position: "absolute", top: 0, bottom: 0, width: "50%" },
  doorImage: { width: "100%", height: "100%" },
  preloadAsset: { position: "absolute", width: 1, height: 1, opacity: 0 },
  progressText: { fontFamily: fonts.heading, fontSize: 13, color: "#fff1c7" },
  loadingActions: {
    position: "absolute",
    top: "48%",
    left: 16,
    right: 16,
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#33240f",
  },
  header: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    backgroundColor: "#fff1d4",
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: "#c6a574",
    zIndex: 8,
  },
  exit: { minWidth: 62, paddingHorizontal: 8 },
  heading: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.heavy, fontSize: 17, color: "#4c572c" },
  subtitle: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: "#727044",
    marginTop: 3,
  },
  debugToggle: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  debugLabel: { fontFamily: fonts.heading, fontSize: 9, color: "#48643c" },
  north: {
    position: "absolute",
    top: 103,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: "#4e783abf",
    borderRadius: 10,
    zIndex: 6,
  },
  northText: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: "#fff4c8",
    letterSpacing: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    padding: 12,
    gap: 10,
    borderRadius: 14,
    backgroundColor: "#fff1d4",
    borderBottomWidth: 3,
    borderBottomColor: "#c6a574",
    zIndex: 8,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusCopy: { flex: 1, gap: 4 },
  statusTitle: { fontFamily: fonts.heading, fontSize: 16, color: "#465731" },
  description: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    color: "#666441",
  },
  cleared: { alignItems: "center", gap: 3 },
  clearedText: { fontFamily: fonts.heading, fontSize: 10, color: "#506837" },
  resultActions: { flexDirection: "row", gap: 8 },
  grow: { flex: 1 },
});
