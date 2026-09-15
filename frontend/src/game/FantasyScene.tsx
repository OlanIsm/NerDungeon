import { Animated, StyleSheet, View } from "react-native";
import { ChunkView } from "./ChunkView";
import { Enemies, Player } from "./Actors";
import { EnvironmentProp, PropSprite, spriteSize } from "./environment/Placeholders";
import { DepthSprite } from "./environment/DepthSprite";
import { PerspectiveGround } from "./environment/PerspectiveGround";
import type { FantasyGame } from "./FantasyGame";
import { GameState } from "./types";

export function FantasyScene({ game, scale, positions, bob, bounds, triggers, playerOrder, enemyOrder, parallax }: {
  game: FantasyGame; scale: number; positions: Map<number, Animated.Value>; bob: Animated.Value; bounds: boolean; triggers: boolean;
  playerOrder: Animated.Value; enemyOrder: Animated.Value; parallax: Animated.Value;
}) {
  const height = game.chunks.viewportHeight;
  const visibleActors = game.encounter && game.state !== GameState.encounterStarting;
  // Environmental Y order stays constant between recycling events. Actors cross that order using Animated values.
  const props = game.chunks.pool.flatMap((chunk) => chunk.definition.props.map((prop, index) => ({ chunk, prop, index })))
    .sort((a, b) => a.chunk.y + a.prop.y - b.chunk.y - b.prop.y);
  return <View pointerEvents="none" testID="fantasy-world" style={s.scene}>
    <PerspectiveGround width={360 * scale} height={height * scale} scale={scale} parallax={parallax} />
    {game.chunks.pool.map((chunk) => <ChunkView key={chunk.id} definition={chunk.definition} position={positions.get(chunk.id)!} scale={scale} viewportHeight={height} bounds={bounds} triggers={triggers} sequenceIndex={chunk.sequenceIndex} />)}
    {props.map(({ chunk, prop, index }, rank) => {
      const size = spriteSize[prop.kind];
      return <DepthSprite key={`${chunk.id}-${index}`} testID={`depth-prop-${chunk.id}-${index}`} position={positions.get(chunk.id)!} x={prop.x} y={prop.y} width={size.width * (prop.scale ?? 1)} height={size.height * (prop.scale ?? 1)} viewportHeight={height} scale={scale} order={10 + rank * 2}>
        <PropSprite kind={prop.kind} />
      </DepthSprite>;
    })}
    {game.encounter?.debug && <View style={{ position: "absolute", zIndex: 2, left: 54 * scale, top: (game.playerY - 223) * scale, width: 252 * scale, height: 261 * scale, borderRadius: 95 * scale, backgroundColor: "#c9d783" }} />}
    {visibleActors && <Animated.View style={[s.layer, { zIndex: enemyOrder }]}><Enemies encounter={game.encounter!} playerY={game.playerY} scale={scale} viewportHeight={height} complete={game.state === GameState.encounterComplete} /></Animated.View>}
    <Animated.View style={[s.layer, { zIndex: playerOrder }]}><Player y={game.playerY} scale={scale} viewportHeight={height} bob={bob} /></Animated.View>
    <View style={[s.layer, { zIndex: 10000 }]}>
      <EnvironmentProp kind="bush" x={3 * scale} y={height * scale} scale={1.8 * scale} />
      <EnvironmentProp kind="bush" x={358 * scale} y={height * scale} scale={1.7 * scale} />
      {triggers && <View style={{ position: "absolute", top: game.playerY * scale, left: 0, right: 0, borderTopWidth: 1, borderStyle: "dashed", borderColor: "#ffffff" }} />}
    </View>
  </View>;
}

const s = StyleSheet.create({
  scene: { position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#94c967" },
  layer: { position: "absolute", inset: 0 },
});
