import { useCallback, useEffect, useRef, useState } from "react";
import { art } from "../assets";
import { Button, Icon, useReducedMotion } from "../components/GameUI";
import { DebugControls } from "../game/DebugControls";
import type { WorldControls } from "../game/PhaserWorld";
import { GameState, type GamePhase } from "../game/types";
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
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<
    "closing" | "loading" | "opening" | "ready"
  >("closing");
  const [closed, setClosed] = useState(false);
  const [doorsLoaded, setDoorsLoaded] = useState(() => new Set<number>());
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [world, setWorld] = useState<WorldControls>();
  const [WorldRenderer, setWorldRenderer] =
    useState<typeof import("../game/PhaserWorld").PhaserWorld>();
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [, render] = useState(0);
  const [debug, setDebug] = useState(false);
  const [bounds, setBounds] = useState(false);
  const [triggers, setTriggers] = useState(false);
  const recorded = useRef(false);
  const loadingStarted = useRef(0);
  const reportReady = useCallback(
    (controls: WorldControls) => setWorld(controls),
    [],
  );
  const reportChange = useCallback(() => render((value) => value + 1), []);
  const reportError = useCallback(() => setLoadError(true), []);
  useEffect(() => {
    if (phase !== "loading" || WorldRenderer) return;
    let active = true;
    import("../game/PhaserWorld").then(
      (module) => {
        if (active) setWorldRenderer(() => module.PhaserWorld);
      },
      () => {
        if (active) reportError();
      },
    );
    return () => {
      active = false;
    };
  }, [phase, WorldRenderer, reportError, attempt]);
  useEffect(() => {
    if (phase !== "closing" || doorsLoaded.size !== 2 || loadError) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setClosed(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, doorsLoaded.size, loadError]);
  useEffect(() => {
    if (phase !== "closing" || !closed) return;
    const timer = setTimeout(
      () => {
        loadingStarted.current = performance.now();
        setPhase("loading");
      },
      reducedMotion ? 0 : 650,
    );
    return () => clearTimeout(timer);
  }, [phase, closed, reducedMotion]);
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setMinimumElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, [phase, attempt]);
  useEffect(() => {
    if (phase === "ready" || phase === "opening" || loadError) return;
    const timer = setTimeout(reportError, 20000);
    return () => clearTimeout(timer);
  }, [phase, attempt, loadError, reportError]);
  useEffect(() => {
    if (phase !== "loading" || !world || !minimumElapsed || loadError) return;
    const timer = setTimeout(() => setPhase("opening"), 0);
    return () => clearTimeout(timer);
  }, [phase, world, minimumElapsed, loadError]);
  useEffect(() => {
    if (phase !== "opening") return;
    const timer = setTimeout(() => setPhase("ready"), reducedMotion ? 0 : 750);
    return () => clearTimeout(timer);
  }, [phase, reducedMotion]);
  useEffect(() => {
    world?.setActive(phase === "ready" && !loadError);
  }, [phase, world, loadError]);
  useEffect(() => {
    world?.setDebug(bounds, triggers);
  }, [world, bounds, triggers]);
  const game = world?.model;
  const gameState = game?.state;
  useEffect(() => {
    if (gameState === GameState.result && !recorded.current) {
      recorded.current = true;
      onComplete();
    }
  }, [gameState, onComplete]);
  const inEncounter =
    gameState === GameState.encounter || gameState === GameState.bossEncounter;
  function retry() {
    setWorld(undefined);
    setLoadError(false);
    setMinimumElapsed(false);
    setClosed(false);
    setDoorsLoaded(new Set());
    setPhase("closing");
    setAttempt((value) => value + 1);
    recorded.current = false;
  }
  return (
    <div
      className="battle-screen"
      data-phase={phase}
      data-testid="fight-page"
      data-loading-started={loadingStarted.current}
    >
      {phase !== "closing" && WorldRenderer && (
        <WorldRenderer
          key={attempt}
          onReady={reportReady}
          onChange={reportChange}
          onError={reportError}
          reducedMotion={reducedMotion}
        />
      )}
      {world && game && (
        <div aria-hidden={phase !== "ready"} inert={phase !== "ready"}>
          <header className="battle-header">
            <Button
              label="Exit"
              onPress={() => navigate("RegionDetail")}
              style={{ minWidth: 62, paddingInline: 8 }}
            />
            <div className="battle-heading">
              <h1>Sunlit Forest</h1>
              <p>The scholar’s trail</p>
            </div>
            <button
              type="button"
              aria-label="Debug controls"
              aria-expanded={debug}
              onClick={() => setDebug(!debug)}
              className="debug-toggle"
            >
              <Icon name="tune-variant" color="#48643c" />
              <span>Debug</span>
            </button>
          </header>
          {!debug && (
            <div className="east">
              <Icon name="arrow-right" size={18} color="#fff4c8" />
              EAST
            </div>
          )}
          {debug && (
            <DebugControls
              game={game}
              act={world.act}
              bounds={bounds}
              triggers={triggers}
              setBounds={setBounds}
              setTriggers={setTriggers}
            />
          )}
          <footer className="battle-footer">
            <div className="battle-status">
              <div className="battle-status-copy">
                <h2 data-testid="fight-status" aria-live="polite">
                  {game.paused ? "Journey paused" : status[game.state]}
                </h2>
                <p>
                  {inEncounter
                    ? `${game.encounter?.name} · ${game.encounter?.count} ${game.encounter?.count === 1 ? "enemy" : "enemies"}`
                    : game.state === GameState.result
                      ? "The forest is safe. A new trail awaits."
                      : game.state === GameState.encounterComplete
                        ? "The trail opens up again."
                        : "Follow the path toward the next clearing."}
                </p>
              </div>
              <div className="battle-cleared">
                <Icon name="flag-checkered" size={19} color="#506837" />
                <span>{game.cleared} cleared</span>
              </div>
            </div>
            {inEncounter && (
              <Button
                label="Complete Encounter"
                tone="gold"
                onPress={() => world.act(() => game.completeEncounter())}
              />
            )}
            {game.state === GameState.result && (
              <div className="result-actions">
                <Button
                  label="Continue trail"
                  tone="gold"
                  onPress={() => world.act(() => game.continueTrail())}
                  style={{ flex: 1 }}
                />
                <Button label="Replay" tone="quiet" onPress={retry} />
              </div>
            )}
          </footer>
        </div>
      )}
      {(phase !== "ready" || loadError) && (
        <div
          className={`gate ${loadError ? "loading" : phase} ${closed ? "closed" : ""}`}
          data-testid={`gate-${phase}`}
          aria-label="Loading adventure"
          aria-live="polite"
        >
          {[art.doorLeft, art.doorRight].map((source, index) => (
            <div
              key={`${attempt}-${index}`}
              className={`gate-door ${index === 0 ? "left" : "right"}`}
            >
              <img
                src={source}
                alt=""
                onLoad={() =>
                  setDoorsLoaded((current) =>
                    current.has(index) ? current : new Set(current).add(index),
                  )
                }
                onError={reportError}
              />
            </div>
          ))}
          {loadError && (
            <div className="loading-actions" role="alert">
              <p>Some assets failed to load.</p>
              <Button
                label="Exit"
                tone="quiet"
                onPress={() => navigate("RegionDetail")}
              />
              <Button label="Retry" tone="gold" onPress={retry} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
