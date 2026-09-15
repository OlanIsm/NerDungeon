import { useEffect, useState } from "react";
import { Animated, AppState, Platform } from "react-native";
import { FantasyGame } from "./FantasyGame";
import { GameState } from "./types";

function syncActorOrder(game: FantasyGame, player: Animated.Value, enemy: Animated.Value, previous: { player: number; enemy: number }) {
  let behindPlayer = 0;
  let behindEnemies = 0;
  for (const chunk of game.chunks.pool) for (const prop of chunk.definition.props) {
    const footY = chunk.y + prop.y;
    if (footY <= game.playerY) behindPlayer++;
    if (footY <= game.playerY - 115) behindEnemies++;
  }
  if (previous.player !== behindPlayer) { previous.player = behindPlayer; player.setValue(9 + behindPlayer * 2); }
  if (previous.enemy !== behindEnemies) { previous.enemy = behindEnemies; enemy.setValue(9 + behindEnemies * 2); }
}

export function useFantasyGame(height: number, scale: number) {
  const [game] = useState(() => new FantasyGame(height));
  const [positions] = useState(() => new Map(game.chunks.pool.map((chunk) => [chunk.id, new Animated.Value(chunk.y * scale)])));
  const [bob] = useState(() => new Animated.Value(0));
  const [playerOrder] = useState(() => new Animated.Value(999));
  const [enemyOrder] = useState(() => new Animated.Value(998));
  const [parallax] = useState(() => new Animated.Value(0));
  const [drawOrder] = useState(() => ({ player: -1, enemy: -1 }));
  const [, render] = useState(0);

  useEffect(() => {
    if (game.chunks.viewportHeight !== height) game.resize(height);
    for (const id of positions.keys()) if (!game.chunks.pool.some((chunk) => chunk.id === id)) positions.delete(id);
    for (const chunk of game.chunks.pool) {
      if (!positions.has(chunk.id)) positions.set(chunk.id, new Animated.Value(chunk.y * scale));
      positions.get(chunk.id)!.setValue(chunk.y * scale);
    }
    syncActorOrder(game, playerOrder, enemyOrder, drawOrder);
  }, [drawOrder, enemyOrder, game, height, playerOrder, positions, scale]);

  // ponytail: JS loop for a small pooled scene; change renderer if target-device profiling requires it.
  useEffect(() => {
    let frame = 0;
    let lastTime = 0;
    let appActive = AppState.currentState !== "background" && AppState.currentState !== "inactive";
    let revision = -1;
    const subscription = AppState.addEventListener("change", (state) => {
      appActive = state === "active";
      lastTime = 0;
    });
    const tick = (time: number) => {
      const visible = Platform.OS !== "web" || typeof document === "undefined" || !document.hidden;
      if (appActive && visible && lastTime) {
        const distance = game.distance;
        game.update((time - lastTime) / 1000);
        if (game.distance !== distance) {
          for (const chunk of game.chunks.pool) positions.get(chunk.id)?.setValue(chunk.y * scale);
          syncActorOrder(game, playerOrder, enemyOrder, drawOrder);
          parallax.setValue((game.distance * 0.16 % 80) * scale);
        }
        bob.setValue(game.state === GameState.walking && !game.paused ? Math.sin(game.walkTime * 13) * 2.5 * scale : 0);
        const nextRevision = game.revision + game.chunks.revision;
        if (revision !== nextRevision) { revision = nextRevision; render(revision); }
      }
      lastTime = appActive && visible ? time : 0;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); subscription.remove(); };
  }, [bob, drawOrder, enemyOrder, game, parallax, playerOrder, positions, scale]);

  function act(action: () => void) {
    action();
    render(game.revision + game.chunks.revision);
  }

  return { game, positions, bob, playerOrder, enemyOrder, parallax, act };
}
