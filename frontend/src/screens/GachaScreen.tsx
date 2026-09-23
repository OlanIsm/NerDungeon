import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { miniIcons } from "../assets";
import { inventory } from "../data/inventory";
import {
  RealmButton,
  RealmFrame,
  fantasy,
  realm,
} from "../components/FantasyUI";
import { fonts } from "../theme";
import type { ScreenProps } from "../types";
export function GachaScreen({ notify }: ScreenProps) {
  const [tab, setTab] = useState("Armory & Relics");
  return (
    <View style={s.page}>
      <View style={s.heading}>
        <Text style={fantasy.title}>The Relic Vault</Text>
        <Text style={fantasy.body}>A little luck. A legendary discovery.</Text>
      </View>
      <View style={s.tabs}>
        {["Armory & Relics", "Spell Scrolls"].map((value) => (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === value }}
            onPress={() => setTab(value)}
            style={[s.tab, tab === value && s.active]}
          >
            <Text style={[s.tabText, tab === value && { color: realm.ink }]}>
              {value}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.stage}>
        <View pointerEvents="none" style={s.halo} />
        <View pointerEvents="none" style={s.haloInner} />
        <Text style={s.vaultName}>
          {tab === "Spell Scrolls"
            ? "Grand Scholar Scrolls"
            : "Grand Scholar Cache"}
        </Text>
        <Image
          source={tab === "Spell Scrolls" ? miniIcons.oakTome : miniIcons.chest}
          resizeMode="contain"
          style={s.chest}
        />
        <View style={s.pedestal} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Inspect Lore"
          onPress={() =>
            notify("An ancient brass-bound vault filled with scholar relics.")
          }
          style={s.lore}
        >
          <Text style={s.tabText}>Inspect Lore</Text>
        </Pressable>
      </View>
      <RealmButton
        label="Summon 1"
        icon="creation"
        onPress={() =>
          notify(
            "Preview summon: Quill of Wisdom (Epic). Tidak ada currency yang dipotong.",
          )
        }
      />
      <Text style={s.cost}>100 Gems or 1,000 Gold</Text>
      <RealmButton
        label="Summon 10"
        icon="treasure-chest"
        onPress={() =>
          notify(
            "Preview ?10 summon. Summoning dan pembelian belum terhubung ke backend.",
          )
        }
      />
      <Text style={s.cost}>900 Gems ? Save 10%</Text>
      <View style={s.favor}>
        <Text style={fantasy.body}>Scholar?s Favor</Text>
        <Text style={fantasy.label}>3 / 10</Text>
      </View>
      <View style={s.track}>
        <View style={s.fill} />
      </View>
      <Text style={s.cost}>Epic or higher guaranteed within 7 summons.</Text>
      <View style={fantasy.divider} />
      <Text style={fantasy.label}>TREASURES WITHIN</Text>
      <View style={s.relics}>
        {[
          { name: "Sunfire Robe", item: inventory[8], odds: "2% LEG" },
          { name: "Wisdom Quill", item: inventory[0], odds: "8% EPIC" },
          { name: "Scholar Aegis", item: inventory[17], odds: "35% RARE" },
        ].map((relic) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Inspect ${relic.name}`}
            key={relic.name}
            onPress={() =>
              notify(`${relic.name} ? ${relic.odds}. Relic preview.`)
            }
            style={s.relic}
          >
            <Image
              source={relic.item.image}
              style={s.relicImage}
              resizeMode="contain"
            />
            <Text style={s.relicName}>{relic.name}</Text>
            <Text style={fantasy.label}>{relic.odds}</Text>
          </Pressable>
        ))}
      </View>
      <RealmFrame>
        <Text style={fantasy.label}>LOOT PROBABILITIES</Text>
        <Text style={fantasy.body}>
          Common 55% ? Rare 35% ? Epic 8% ? Legendary 2%
        </Text>
        <Text style={s.cost}>Preview only ? No currency is spent.</Text>
      </RealmFrame>
    </View>
  );
}
const s = StyleSheet.create({
  page: { gap: 10, paddingHorizontal: 8 },
  heading: { gap: 5, alignItems: "center", paddingVertical: 14 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderColor: realm.edge },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  active: { borderBottomColor: realm.gold },
  tabText: { fontFamily: fonts.heading, fontSize: 12, color: realm.muted },
  stage: {
    height: 235,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  vaultName: {
    fontFamily: fonts.heading,
    fontSize: 19,
    color: realm.ink,
    textAlign: "center",
    position: "absolute",
    top: 18,
  },
  halo: {
    position: "absolute",
    width: 185,
    height: 185,
    borderRadius: 93,
    borderWidth: 1,
    borderColor: "#705436",
    backgroundColor: "#e9c379",
    top: 52,
  },
  haloInner: {
    position: "absolute",
    width: 155,
    height: 155,
    borderRadius: 78,
    borderWidth: 1,
    borderColor: "#8d6c43",
    top: 67,
  },
  chest: { width: 160, height: 140, marginTop: 24, zIndex: 2 },
  pedestal: {
    width: 170,
    height: 18,
    borderRadius: 90,
    backgroundColor: "#b58b55",
    borderBottomWidth: 2,
    borderBottomColor: "#6b5135",
    marginTop: -12,
  },
  lore: { minHeight: 48, justifyContent: "center", paddingHorizontal: 20 },
  cost: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 17,
    color: realm.muted,
    textAlign: "center",
  },
  favor: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  track: {
    height: 8,
    backgroundColor: "#b58b55",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: { width: "30%", height: "100%", backgroundColor: realm.gold },
  relics: { flexDirection: "row", gap: 10, marginBottom: 16 },
  relic: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: realm.edge,
  },
  relicImage: { width: 70, height: 70 },
  relicName: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: realm.ink,
    textAlign: "center",
  },
});
