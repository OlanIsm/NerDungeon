import { useEffect, useState } from "react";
import { Animated, AppState, Platform } from "react-native";
import { FantasyGame } from "./FantasyGame";

export function useFantasyGame(height: number, scale: number, active = true) {
  const [game] = useState(() => new FantasyGame(height));
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
      if (active && appActive && visible && lastTime) {
        const distance = game.distance;
        game.update((time - lastTime) / 1000);
        if (game.distance !== distance) {
          scrollX.setValue(-game.distance * scale);
        }
        const nextRevision = game.revision + game.chunks.revision;
        if (revision !== nextRevision) {
          revision = nextRevision;
          render(revision);
        }
      }
      lastTime = active && appActive && visible ? time : 0;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      subscription.remove();
    };
  }, [active, game, scale, scrollX]);

  function act(action: () => void) {
    action();
    render(game.revision + game.chunks.revision);
  }

  return { game, scrollX, act };
}
