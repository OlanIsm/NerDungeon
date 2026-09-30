import type { CSSProperties } from "react";
import type { PropsWithChildren } from "react";
import { Button, type IconName } from "./GameUI";
import { colors, fonts, outline, radii } from "../theme";
export const realm = {
  ink: colors.ink,
  muted: colors.muted,
  gold: colors.wood,
  edge: colors.edge,
  dark: colors.ink,
  panel: colors.parchment,
};
export function RealmFrame({
  children,
  style,
  variant = "parchment",
}: PropsWithChildren<{
  style?: CSSProperties;
  variant?: "parchment" | "sage";
}>) {
  return (
    <div
      style={{
        ...f.frame,
        ...{ backgroundColor: colors[variant] },
        ...(style || {}),
      }}
      className="stack"
    >
      <div aria-hidden={true} style={f.highlight} className="stack" />
      {children}
    </div>
  );
}
export function RealmButton({
  label,
  onPress,
  icon = "chevron-right",
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
}) {
  return <Button label={label} onPress={onPress} icon={icon} tone="gold" />;
}
export const fantasy = {
  title: {
    fontFamily: fonts.heavy,
    fontSize: 27,
    lineHeight: "34px",
    color: realm.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: "21px",
    color: realm.muted,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 12,
    lineHeight: "17px",
    color: realm.gold,
  },
  divider: {
    height: 1,
    backgroundColor: "#d6c8aa",
    marginTop: 12,
    marginBottom: 12,
  },
} satisfies Record<string, CSSProperties>;
const f = {
  frame: {
    borderWidth: outline.standard,
    borderBottomWidth: outline.base,
    borderColor: colors.edge,
    borderRadius: radii.panel,
    borderTopRightRadius: 12,
    padding: 16,
    gap: 12,
  },
  highlight: {
    position: "absolute",
    top: 3,
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#ffffff99",
  },
} satisfies Record<string, CSSProperties>;
