import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { icons, miniIcons } from "../assets";
import { inventory } from "../data/inventory";
import {
  Button,
  Icon,
  ImageBadge,
  Meter,
  Tabs,
} from "../components/GameUI";
import { RealmFrame, fantasy } from "../components/FantasyUI";
import { colors, fonts, ui } from "../theme";
import type { ScreenProps } from "../types";
import type { GameData } from "../gameApi";

const vaults = ["Armory & Relics", "Spell Scrolls"] as const;
export function GachaScreen({ notify, onSummon, gems = 320, favor = 3 }: ScreenProps & { onSummon: (count: 1 | 10) => Promise<GameData>; gems?: number; favor?: number }) {
  const [tab, setTab] = useState<(typeof vaults)[number]>("Armory & Relics");
  return (
    <View style={s.page}>
      <View style={s.heading}>
        <Text style={fantasy.title}>The Relic Vault</Text>
      </View>
      <Tabs values={vaults} selected={tab} onChange={setTab} />

      <View style={s.showcase}>
        <View pointerEvents="none" style={s.arch} />
        <View style={s.banner}>
          <Text style={s.bannerText}>
            {tab === "Spell Scrolls"
              ? "Grand Scholar Scrolls"
              : "Grand Scholar Cache"}
          </Text>
        </View>
        <View pointerEvents="none" style={s.ground} />
        <View pointerEvents="none" style={s.starLeft}>
          <Icon name="star-four-points" color="#aa863d" size={19} />
        </View>
        <View pointerEvents="none" style={s.starRight}>
          <Icon name="star-four-points" color="#aa863d" size={12} />
        </View>
        <Image
          accessibilityLabel={
            tab === "Spell Scrolls" ? "Scholar tome" : "Scholar treasure chest"
          }
          source={tab === "Spell Scrolls" ? miniIcons.oakTome : miniIcons.chest}
          resizeMode="contain"
          style={s.chest}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Inspect Lore"
          onPress={() =>
            notify("An ancient brass-bound vault filled with scholar relics.")
          }
          style={s.lore}
        >
          <Icon name="information-outline" size={22} color={colors.teal} />
        </Pressable>
      </View>

      <RealmFrame style={s.information}>
        <View style={ui.between}>
          <Text style={s.contains}>Treasures within</Text>
          <Text style={s.preview}>Preview</Text>
        </View>
        <View style={s.relics}>
          {inventory.map((item) => (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityLabel={`Inspect ${item.name}`}
              onPress={() => notify(`${item.name} · Relic preview.`)}
              style={({ pressed }) => [
                s.relic,
                pressed && { backgroundColor: colors.inset },
              ]}
            >
              <Image
                source={item.image}
                resizeMode="contain"
                style={s.relicImage}
              />
              <Text style={s.relicName}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
        <View style={s.costRow}>
          <ImageBadge source={icons.gems} text="100" size={24} />
        </View>
        <Button
          label="Summon 1"
          icon="treasure-chest"
          tone="gold"
          onPress={() => onSummon(1).then((data) => notify(`You received ${data.rewards?.[0]}.`)).catch((error) => notify(error.message))}
        />
        <View style={s.multiPull}>
          <View style={ui.flex}>
            <Button
              label="Summon 10"
              tone="teal"
              onPress={() => onSummon(10).then((data) => notify(`You received: ${data.rewards?.join(", ")}.`)).catch((error) => notify(error.message))}
            />
          </View>
          <View style={s.multiCost}>
            <Text style={s.gemCost}>900 Gems</Text>
            <Text style={ui.label}>Save 10%</Text>
          </View>
        </View>
        <Text style={s.disclosure}>{gems} gems available · One item per summon.</Text>
      </RealmFrame>

      <View style={s.favor}>
        <View style={ui.between}>
          <Text style={s.favorTitle}>Scholar’s Favor</Text>
          <Text style={ui.label}>{favor} / 10</Text>
        </View>
        <Meter value={favor * 10} color={colors.teal} label="Summon progress" />
        <Text style={ui.body}>One of four items per summon.</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  page: { gap: 10 },
  heading: { gap: 4, alignItems: "center", paddingTop: 4, paddingBottom: 2 },
  showcase: {
    minHeight: 192,
    alignItems: "center",
    paddingTop: 7,
    paddingBottom: 8,
  },
  arch: {
    position: "absolute",
    width: 214,
    height: 184,
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: colors.sage,
    top: 7,
    borderWidth: 1,
    borderColor: "#b7c6a6",
  },
  banner: {
    alignSelf: "center",
    maxWidth: "100%",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.edge,
    borderRadius: 9,
    borderBottomRightRadius: 16,
    backgroundColor: colors.teal,
    zIndex: 1,
  },
  bannerText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    lineHeight: 20,
    color: colors.parchment,
    textAlign: "center",
  },
  chest: { width: 166, height: 130, marginTop: 5 },
  ground: {
    position: "absolute",
    bottom: 9,
    width: 154,
    height: 18,
    borderRadius: 90,
    backgroundColor: "#bdc8a5",
  },
  starLeft: { position: "absolute", left: "21%", top: 93 },
  starRight: { position: "absolute", right: "23%", top: 72 },
  lore: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 48,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 6,
  },
  information: { gap: 8, padding: 12 },
  contains: { ...ui.title, fontSize: 17 },
  preview: {
    ...ui.label,
    backgroundColor: colors.inset,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  relics: { flexDirection: "row", gap: 8 },
  relic: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 3,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  relicImage: { width: 44, height: 41 },
  relicName: {
    fontFamily: fonts.heading,
    fontSize: 11,
    lineHeight: 14,
    color: colors.ink,
    textAlign: "center",
  },
  rarities: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 2,
  },
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 2,
  },
  multiPull: { flexDirection: "row", alignItems: "center", gap: 15 },
  multiCost: { alignItems: "center", gap: 4 },
  gemCost: { fontFamily: fonts.heading, fontSize: 13, color: colors.ink },
  disclosure: { ...ui.label, textAlign: "center", fontSize: 11 },
  favor: { padding: 8, gap: 8 },
  favorTitle: { ...ui.title, fontSize: 15 },
});
