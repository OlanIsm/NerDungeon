import type { CSSProperties } from "react";
import { fonts } from "../theme";
import { WORLD } from "./level";
import { GameState } from "./types";
import type { FantasyGame } from "./FantasyGame";
export function DebugControls({
  game,
  act,
  bounds,
  triggers,
  setBounds,
  setTriggers,
}: {
  game: FantasyGame;
  act: (action: () => void) => void;
  bounds: boolean;
  triggers: boolean;
  setBounds: (value: boolean) => void;
  setTriggers: (value: boolean) => void;
}) {
  return (
    <div style={s.panel} className="stack">
      <span style={s.title} className="text">
        Traversal debug
      </span>
      <span data-testid="fight-state" style={s.meta} className="text">
        {game.state} · {game.speed} units/s · {game.chunks.pool.length} chunks ·{" "}
        {game.chunks.recycled} recycled
      </span>
      <div style={s.controls} className="stack">
        {[
          {
            label: game.paused ? "Resume Scrolling" : "Pause Scrolling",
            action: () => act(() => game.togglePause()),
          },
          {
            label: "Trigger Encounter",
            action: () => act(() => game.triggerEncounter()),
            disabled: game.state !== GameState.walking,
          },
          {
            label: "Decrease Speed",
            action: () =>
              act(() => game.setSpeed(game.speed - WORLD.speedStep)),
            disabled: game.speed <= WORLD.minSpeed,
          },
          {
            label: "Increase Speed",
            action: () =>
              act(() => game.setSpeed(game.speed + WORLD.speedStep)),
            disabled: game.speed >= WORLD.maxSpeed,
          },
          {
            label: "Show Chunk Bounds",
            action: () => setBounds(!bounds),
            selected: bounds,
          },
          {
            label: "Show Encounter Trigger",
            action: () => setTriggers(!triggers),
            selected: triggers,
          },
        ].map((control) => (
          <button
            key={control.label}
            role="button"
            aria-label={control.label}
            aria-disabled={control.disabled}
            aria-pressed={control.selected}
            disabled={control.disabled}
            onClick={control.action}
            style={{
              ...s.control,
              ...((control.selected && s.selected) || {}),
              ...((control.disabled && s.disabled) || {}),
            }}
            className="stack pressable"
            type="button"
          >
            <span style={s.controlText} className="text">
              {control.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
const s = {
  panel: {
    position: "absolute",
    top: 88,
    left: 12,
    right: 12,
    padding: 12,
    backgroundColor: "#fff1cfee",
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: "#967044",
    zIndex: 10,
  },
  title: { fontFamily: fonts.heading, fontSize: 14, color: "#4d3824" },
  meta: { fontFamily: fonts.label, fontSize: 11, color: "#4d5934" },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  control: {
    width: "48%",
    minHeight: 48,
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#e4d7b0",
    justifyContent: "center",
    alignItems: "center",
  },
  selected: { backgroundColor: "#b6dab0" },
  disabled: { opacity: 0.4 },
  controlText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    textAlign: "center",
    color: "#3e442c",
  },
} satisfies Record<string, CSSProperties>;
