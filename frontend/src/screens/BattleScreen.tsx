import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { art } from "../assets";
import { Button, Icon } from "../components/GameUI";
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

export function BattleScreen({ navigate }: ScreenProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [run, setRun] = useState(0);
  const [loadedAssets, setLoadedAssets] = useState(() => new Set<number>());
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const progress = loadedAssets.size / fightAssets.length;

  if (progress < 1) {
    return (
      <View
        accessibilityLabel="Loading fight assets"
        accessibilityLiveRegion="polite"
        style={s.loading}
        onLayout={({ nativeEvent: { layout } }) =>
          setSize({ width: layout.width, height: layout.height })
        }
      >
        {fightAssets.map((source, index) => (
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
        <Image
          accessibilityIgnoresInvertColors
          source={art.nerdLoading}
          resizeMode="contain"
          style={s.loadingNerd}
        />
        <Image
          accessibilityIgnoresInvertColors
          source={art.nerdiusTitle}
          resizeMode="contain"
          style={s.loadingTitle}
        />
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={s.progressText}>
          {loadError
            ? "Some assets failed to load"
            : `Preparing adventure... ${Math.round(progress * 100)}%`}
        </Text>
        {loadError && (
          <View style={s.loadingActions}>
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
                setLoadError(false);
                setAttempt(attempt + 1);
              }}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={s.screen}
      onLayout={({ nativeEvent: { layout } }) => {
        if (layout.width !== size.width || layout.height !== size.height)
          setSize({ width: layout.width, height: layout.height });
      }}
    >
      {size.width > 0 && size.height > 0 && (
        <Journey
          key={run}
          width={size.width}
          height={size.height}
          exit={() => navigate("RegionDetail")}
          replay={() => setRun(run + 1)}
        />
      )}
    </View>
  );
}

function Journey({
  width,
  height,
  exit,
  replay,
}: {
  width: number;
  height: number;
  exit: () => void;
  replay: () => void;
}) {
  const scale = width / WORLD.width;
  const { game, bob, scrollX, act } = useFantasyGame(height / scale, scale);
  const [debug, setDebug] = useState(false);
  const [bounds, setBounds] = useState(false);
  const [triggers, setTriggers] = useState(false);
  const inEncounter =
    game.state === GameState.encounter ||
    game.state === GameState.bossEncounter;
  return (
    <View style={s.screen} testID="fight-page">
      <FantasyScene
        game={game}
        scale={scale}
        bob={bob}
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#10284e",
  },
  preloadAsset: { position: "absolute", width: 1, height: 1, opacity: 0 },
  loadingNerd: { width: 230, height: 230 },
  loadingTitle: { width: "100%", maxWidth: 320, height: 150, marginTop: -52 },
  progressTrack: {
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
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#f4b927",
  },
  progressText: {
    marginTop: 12,
    fontFamily: fonts.heading,
    fontSize: 13,
    color: "#fff1c7",
  },
  loadingActions: { flexDirection: "row", gap: 10, marginTop: 14 },
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
