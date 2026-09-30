import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import atlas from "../../../assets/character/mc-walk/spritesheet.json";
import { useReducedMotion } from "../../components/GameUI";
import type { FantasyGame } from "../FantasyGame";
import { GameState } from "../types";

export const walkTexture = require("../../../assets/character/mc-walk/spritesheet.png");
const frames = Object.entries(atlas.frames)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, value]) => value.frame);

export function WalkingSprite({
  game,
  size,
}: {
  game: FantasyGame;
  size: number;
}) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    let request = 0;
    let previous = -1;
    const tick = () => {
      const next =
        game.state === GameState.walking && !game.paused && !reducedMotion
          ? Math.floor(game.walkTime * 12) % frames.length
          : 0;
      if (next !== previous) {
        previous = next;
        setIndex(next);
      }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [game, reducedMotion]);
  const frame = frames[index];
  const scale = size / frame.w;
  return (
    <View
      testID={`walk-frame-${index}`}
      style={{ width: size, height: size, overflow: "hidden" }}
    >
      <Image
        source={walkTexture}
        resizeMode="stretch"
        style={{
          position: "absolute",
          left: -frame.x * scale,
          top: -frame.y * scale,
          width: atlas.meta.size.w * scale,
          height: atlas.meta.size.h * scale,
        }}
      />
    </View>
  );
}
