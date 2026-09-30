import type { CSSProperties } from "react";
import { colors, fonts } from "../theme";
import type { Screen } from "../types";
type BottomNavItemProps = {
  screen: Screen;
  icon: string;
  size: number;
  iconOffsetX?: number;
  selected: boolean;
  onPress: () => void;
};
export function BottomNavItem({
  screen,
  icon,
  selected,
  onPress,
}: BottomNavItemProps) {
  return (
    <button
      role="tab"
      aria-selected={selected}
      aria-label={screen}
      onClick={onPress}
      style={{ ...s.item, ...((selected && s.selected) || {}) }}
      className="stack pressable"
      type="button"
    >
      {selected && (
        <div aria-hidden={true} style={s.highlight} className="stack" />
      )}
      <img
        src={icon}
        style={{ ...s.icon, objectFit: "contain" }}
        className="art-image"
        alt=""
        draggable={false}
      />
      <span
        style={{ ...s.label, ...((selected && s.activeLabel) || {}) }}
        className="text"
      >
        {screen}
      </span>
      {selected && <div style={s.marker} className="stack" />}
    </button>
  );
}
const s = {
  item: {
    flex: "1 1 0%",
    minWidth: 0,
    minHeight: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingBottom: 0,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 15,
    gap: 0,
    transform: "translateY(-4px)",
  },
  selected: {
    backgroundColor: colors.gold,
    borderColor: colors.edge,
    borderBottomWidth: 4,
    transform: "translateY(" + -5 + "px)",
  },
  highlight: {
    position: "absolute",
    top: 3,
    left: 10,
    right: 10,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#fff0b0",
  },
  icon: { width: 60, height: 52 },
  label: {
    transform: "translateY(-7px)",
    fontFamily: fonts.heading,
    fontSize: 11,
    lineHeight: "14px",
    color: colors.parchment,
  },
  activeLabel: { color: colors.ink },
  marker: {
    position: "absolute",
    bottom: -6,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.edge,
    backgroundColor: colors.parchment,
  },
} satisfies Record<string, CSSProperties>;
