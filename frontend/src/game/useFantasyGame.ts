import { useEffect, useState } from "react";
import { Animated, AppState, Platform } from "react-native";
import { FantasyGame } from "./FantasyGame";
import { GameState } from "./types";

export function useFantasyGame(height: number, scale: number) {
  const [game] = useState(() => new FantasyGame(height));
  const [bob] = useState(() => new Animated.Value(0));
  const [scrollX] = useState(() => new Animated.Value(0));
  const [, render] = useState(0);

  useEffect(() => {
    if (game.chunks.viewportHeight !== height) game.resize(height);
    scrollX.setValue(-game.distance * scale);
  }, [game, height, scale, scrollX]);

  // ponytail: JS loop for a small pooled scene; change renderer if target-device profiling requires it.
  useEffect(() => {
    let frame = 0;
    let lastTime = 0;
    let appActive =
      AppState.currentState !== "background" &&
      AppState.currentState !== "inactive";
    let revision = -1;
    const subscription = AppState.addEventListener("change", (state) => {
      appActive = state === "active";
      lastTime = 0;
    });
    const tick = (time: number) => {
      const visible =
        Platform.OS !== "web" ||
        typeof document === "undefined" ||
        !document.hidden;
      if (appActive && visible && lastTime) {
        const distance = game.distance;
        game.update((time - lastTime) / 1000);
        if (game.distance !== distance) {
          scrollX.setValue(-game.distance * scale);
        }
        bob.setValue(
          game.state === GameState.walking && !game.paused
            ? Math.sin(game.walkTime * 13) * 2.5 * scale
            : 0,
        );
        const nextRevision = game.revision + game.chunks.revision;
        if (revision !== nextRevision) {
          revision = nextRevision;
          render(revision);
        }
      }
      lastTime = appActive && visible ? time : 0;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      subscription.remove();
    };
  }, [bob, game, scale, scrollX]);

  function act(action: () => void) {
    action();
    render(game.revision + game.chunks.revision);
  }

  return { game, bob, scrollX, act };
}
