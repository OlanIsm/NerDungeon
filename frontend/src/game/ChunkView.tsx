import { memo } from "react";
import { Animated, Text, View } from "react-native";
import { fonts } from "../theme";
import { ArenaClearing, Bridge, RiverEdge } from "./environment/Placeholders";
import { DepthSprite } from "./environment/DepthSprite";
import { WORLD } from "./level";
import type { ChunkDefinition } from "./types";

export const ChunkView = memo(function ChunkView({ definition, position, scale, bounds, triggers, sequenceIndex, viewportHeight }: {
  definition: ChunkDefinition; position: Animated.Value; scale: number; viewportHeight: number;
  bounds: boolean; triggers: boolean; sequenceIndex: number;
}) {
  const depth = { position, scale, viewportHeight };
  return <>
    {(definition.type === "encounterArena" || definition.type === "bossArena") && <DepthSprite {...depth} x={180} y={334} width={295} height={250} order={2}><ArenaClearing /></DepthSprite>}
    {definition.type === "bridge" && <>
      <DepthSprite {...depth} x={180} y={270} width={720} height={92} order={2} testID={`river-${sequenceIndex}`}><RiverEdge /></DepthSprite>
      <DepthSprite {...depth} x={180} y={279} width={215} height={111} order={3} testID={`bridge-${sequenceIndex}`}><Bridge /></DepthSprite>
    </>}
    {definition.type === "river" && <DepthSprite {...depth} x={-35} y={375} width={145} height={315} order={2}><RiverEdge /></DepthSprite>}
    {[64, 177, 287, 396].map((y, index) => <DepthSprite key={y} {...depth} x={index % 2 ? 202 : 150} y={y} width={9} height={4} order={4}>
      <View style={{ width: "100%", height: "100%", borderRadius: 4, backgroundColor: "#c6a76b" }} />
    </DepthSprite>)}
    <Animated.View pointerEvents="none" testID={`terrain-chunk-${sequenceIndex}`} style={{ position: "absolute", left: 0, top: 0, width: WORLD.width * scale, height: WORLD.chunkHeight * scale, transform: [{ translateY: position }], zIndex: 9000 }}>
      {bounds && <View style={{ position: "absolute", inset: 0, borderWidth: 2, borderColor: "#f7f1b0" }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 10, backgroundColor: "#244a39", color: "#fff4ce", alignSelf: "flex-start", padding: 3 }}>{sequenceIndex + 1}: {definition.type}</Text>
      </View>}
      {triggers && definition.triggerY !== undefined && <View style={{ position: "absolute", top: definition.triggerY * scale, left: 0, right: 0, borderTopWidth: 2, borderColor: "#c43c61" }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 10, color: "#79203a", backgroundColor: "#ffe0d6", alignSelf: "flex-start" }}>Encounter trigger</Text>
      </View>}
    </Animated.View>
  </>;
});
