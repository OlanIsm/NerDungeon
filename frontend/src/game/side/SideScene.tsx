import {
  Animated,
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";
import type { FantasyGame } from "../FantasyGame";
import { GameState } from "../types";

const PLAYER_X = 102;
const SOURCE_WIDTH = 1118;
const SOURCE_HEIGHT = 844;
const SOURCE_GROUND_Y = 657;

const hero = require("../../../assets/character/mc.png");
const soda = require("../../../assets/character/soda-cutout.png");

const layers: readonly {
  name: string;
  source: ImageSourcePropType;
  speed: number;
}[] = [
  {
    name: "background",
    source: require("../../../assets/parallax backgound pack/_11_background.png"),
    speed: 0,
  },
  {
    name: "distant-clouds",
    source: require("../../../assets/parallax backgound pack/_10_distant_clouds.png"),
    speed: 0.04,
  },
  {
    name: "distant-clouds-2",
    source: require("../../../assets/parallax backgound pack/_09_distant_clouds1.png"),
    speed: 0.07,
  },
  {
    name: "clouds",
    source: require("../../../assets/parallax backgound pack/_08_clouds.png"),
    speed: 0.1,
  },
  {
    name: "huge-clouds",
    source: require("../../../assets/parallax backgound pack/_07_huge_clouds.png"),
    speed: 0.14,
  },
  {
    name: "hill-2",
    source: require("../../../assets/parallax backgound pack/_06_hill2.png"),
    speed: 0.2,
  },
  {
    name: "hill-1",
    source: require("../../../assets/parallax backgound pack/_05_hill1.png"),
    speed: 0.28,
  },
  {
    name: "bushes",
    source: require("../../../assets/parallax backgound pack/_04_bushes.png"),
    speed: 0.38,
  },
  {
    name: "distant-trees",
    source: require("../../../assets/parallax backgound pack/_03_distant_trees.png"),
    speed: 0.5,
  },
  {
    name: "trees",
    source: require("../../../assets/parallax backgound pack/_02_trees and bushes.png"),
    speed: 0.72,
  },
  {
    name: "ground",
    source: require("../../../assets/parallax backgound pack/_01_ground.png"),
    speed: 1,
  },
];

export const fightAssets = [hero, soda, ...layers.map((layer) => layer.source)];

export function SideScene({
  game,
  scale,
  bob,
  scrollX,
  bounds,
  triggers,
}: {
  game: FantasyGame;
  scale: number;
  bob: Animated.Value;
  scrollX: Animated.Value;
  bounds: boolean;
  triggers: boolean;
}) {
  const width = 360;
  const height = game.chunks.viewportHeight;
  const groundY = game.playerY;
  const imageHeight = height * scale;
  const tileWidth = imageHeight * (SOURCE_WIDTH / SOURCE_HEIGHT);
  const imageTop =
    (groundY - height * (SOURCE_GROUND_Y / SOURCE_HEIGHT)) * scale;
  const visibleActors =
    game.encounter !== null && game.state !== GameState.encounterStarting;

  return (
    <View
      pointerEvents="none"
      testID="fantasy-world"
      style={[s.scene, { width: width * scale, height: height * scale }]}
    >
      {layers.map((layer) => (
        <ParallaxLayer
          key={layer.name}
          {...layer}
          imageHeight={imageHeight}
          imageTop={imageTop}
          tileWidth={tileWidth}
          viewportWidth={width * scale}
          scrollX={scrollX}
        />
      ))}

      <View
        testID="side-ground"
        style={[s.groundLine, { top: groundY * scale, width: width * scale }]}
      />

      <ChunkDebug
        game={game}
        scale={scale}
        scrollX={scrollX}
        bounds={bounds}
        triggers={triggers}
      />

      <View
        testID="fight-player"
        accessibilityLabel="Nerd Mage walking east"
        style={{
          position: "absolute",
          left: (PLAYER_X - 58) * scale,
          top: (groundY - 116) * scale,
          width: 116 * scale,
          height: 116 * scale,
        }}
      >
        <View style={s.shadow} />
        <Animated.View
          style={[
            s.fill,
            {
              transform: [
                { translateY: bob },
                {
                  rotate: bob.interpolate({
                    inputRange: [-3, 0, 3],
                    outputRange: ["-1.5deg", "0deg", "1.5deg"],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            accessibilityIgnoresInvertColors
            source={hero}
            resizeMode="contain"
            style={s.sprite}
          />
        </Animated.View>
      </View>

      {visibleActors && (
        <View style={s.fill}>
          {Array.from({ length: game.encounter!.count }, (_, index) => {
            const boss = game.encounter!.boss;
            const size = boss ? 168 : 108;
            const centerX = PLAYER_X + 142 + index * 68;
            return (
              <View
                key={index}
                testID={`fight-enemy-${index}`}
                accessibilityLabel={
                  boss ? "Soda boss" : `Soda enemy ${index + 1}`
                }
                style={{
                  position: "absolute",
                  left: (centerX - size / 2) * scale,
                  top: (groundY - size) * scale,
                  width: size * scale,
                  height: size * scale,
                  opacity:
                    game.state === GameState.encounterComplete ? 0.35 : 1,
                }}
              >
                <View style={s.shadow} />
                <Image
                  accessibilityIgnoresInvertColors
                  source={soda}
                  resizeMode="contain"
                  style={s.sprite}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ParallaxLayer({
  name,
  source,
  speed,
  imageHeight,
  imageTop,
  tileWidth,
  viewportWidth,
  scrollX,
}: {
  name: string;
  source: ImageSourcePropType;
  speed: number;
  imageHeight: number;
  imageTop: number;
  tileWidth: number;
  viewportWidth: number;
  scrollX: Animated.Value;
}) {
  const copies = Math.ceil(viewportWidth / tileWidth) + (speed === 0 ? 0 : 1);
  const translateX = speed === 0
    ? 0
    : Animated.multiply(
        Animated.modulo(Animated.multiply(scrollX, -speed), tileWidth),
        -1,
      );
  return (
    <View testID={`parallax-${name}`} style={s.fill}>
      <Animated.View
        style={{
          position: "absolute",
          top: imageTop,
          left: 0,
          width: tileWidth * copies,
          height: imageHeight,
          flexDirection: "row",
          transform: [{ translateX }],
        }}
      >
        {Array.from({ length: copies }, (_, index) => (
          <Image
            key={index}
            accessibilityIgnoresInvertColors
            source={source}
            resizeMode="stretch"
            style={{ width: tileWidth, height: imageHeight }}
          />
        ))}
      </Animated.View>
    </View>
  );
}

function ChunkDebug({
  game,
  scale,
  scrollX,
  bounds,
  triggers,
}: {
  game: FantasyGame;
  scale: number;
  scrollX: Animated.Value;
  bounds: boolean;
  triggers: boolean;
}) {
  const height = game.chunks.viewportHeight;
  return (
    <Animated.View style={[s.fill, { transform: [{ translateX: scrollX }] }]}>
      {game.chunks.pool.map((chunk) => {
        const left =
          PLAYER_X + (game.playerY - chunk.y - chunk.height) + game.distance;
        return (
          <View
            key={chunk.id}
            testID={`terrain-chunk-${chunk.sequenceIndex}`}
            style={{
              position: "absolute",
              top: 0,
              left: left * scale,
              width: chunk.height * scale,
              height: height * scale,
              borderWidth: bounds ? 2 : 0,
              borderColor: "#f7f1b0",
            }}
          >
            {triggers && chunk.definition.triggerY !== undefined && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: (chunk.height - chunk.definition.triggerY) * scale,
                  borderLeftWidth: 2,
                  borderColor: "#c43c61",
                }}
              />
            )}
          </View>
        );
      })}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  scene: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "hidden",
    backgroundColor: "#d9bd91",
  },
  fill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  groundLine: {
    position: "absolute",
    left: 0,
    height: 2,
  },
  sprite: {
    width: "100%",
    height: "100%",
  },
  shadow: {
    position: "absolute",
    left: "16%",
    right: "12%",
    bottom: "1%",
    height: "9%",
    borderRadius: 999,
    backgroundColor: "rgba(68, 52, 35, 0.24)",
    transform: [{ scaleY: 0.42 }],
  },
});
