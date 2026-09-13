import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { art } from "../assets";
import { Badge, Button, Meter, Panel, Tabs } from "../components/GameUI";
import { colors, ui } from "../theme";
import type { ScreenProps } from "../types";

export function GachaScreen({ notify }: ScreenProps) {
  const [tab, setTab] = useState("Armory & Relics");
  return (
    <View style={{ gap: 16 }}>
      <Tabs
        values={["Armory & Relics", "Spell Scrolls"]}
        selected={tab}
        onChange={setTab}
      />
      <Panel>
        <View style={ui.between}>
          <View style={ui.flex}>
            <Text style={ui.heading}>
              {tab === "Spell Scrolls"
                ? "Grand Scholar Scrolls"
                : "Grand Scholar Cache"}
            </Text>
            <Text style={ui.label}>EXCAVATION ALCOVE #4</Text>
          </View>
          <Badge
            text="TIER 5 VAULT"
            color={colors.teal}
            icon="shield-check-outline"
          />
        </View>
        <View
          style={{
            borderWidth: 3,
            borderColor: colors.edge,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Image
            source={art.chest}
            style={{ width: "100%", height: 184 }}
            resizeMode="cover"
          />
          <View style={{ position: "absolute", top: 8, left: 8 }}>
            <Badge text="FEATURED CACHE" icon="creation" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Inspect Lore"
            onPress={() =>
              notify(
                "Grand Scholar Cache — an ancient brass-bound vault filled with scholar relics.",
              )
            }
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              padding: 14,
              minHeight: 48,
              backgroundColor: colors.wood,
            }}
          >
            <Text style={[ui.label, { color: colors.white }]}>
              Inspect Lore
            </Text>
          </Pressable>
        </View>
        <View style={ui.between}>
          <Text style={ui.label}>FEATURED VAULT RELICS</Text>
          <Text style={ui.label}>Tap to inspect</Text>
        </View>
        <View style={ui.row}>
          {[
            { name: "Sunfire Robe", image: art.robe, odds: "2% LEG" },
            { name: "Wisdom Quill", image: art.quill, odds: "8% EPIC" },
            { name: "Scholar Aegis", image: art.shield, odds: "35% RARE" },
          ].map((item) => (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityLabel={`Inspect ${item.name}`}
              onPress={() =>
                notify(
                  `${item.name} · ${item.odds}. Relic preview from the Grand Scholar Cache.`,
                )
              }
              style={[
                ui.flex,
                ui.center,
                {
                  padding: 8,
                  backgroundColor: "#fff2d9",
                  borderRadius: 8,
                  gap: 6,
                },
              ]}
            >
              <Image
                source={item.image}
                style={{ width: 58, height: 58, borderRadius: 6 }}
              />
              <Text style={[ui.label, { textAlign: "center" }]}>
                {item.name}
              </Text>
              <Badge text={item.odds} />
            </Pressable>
          ))}
        </View>
        <View style={ui.inset}>
          <View style={ui.between}>
            <Text style={ui.label}>LOOT PROBABILITIES</Text>
            <Text style={ui.label}>100% Fair Odds</Text>
          </View>
          <View
            style={{
              height: 9,
              borderRadius: 8,
              overflow: "hidden",
              flexDirection: "row",
            }}
          >
            {[
              ["55%", "#c7b391"],
              ["35%", colors.teal],
              ["8%", "#dbaa60"],
              ["2%", colors.gold],
            ].map(([width, backgroundColor]) => (
              <View
                key={width}
                style={{ flex: parseInt(width), backgroundColor }}
              />
            ))}
          </View>
          <Text style={ui.label}>Common 55% Rare 35% Epic 8% Leg. 2%</Text>
        </View>
        <View style={ui.inset}>
          <View style={ui.between}>
            <Text style={ui.label}>Scholar’s Favor Pity</Text>
            <Text style={ui.label}>3 / 10 Pulls</Text>
          </View>
          <Meter value={30} />
          <Text style={ui.label}>
            Guaranteed Epic or Higher in next 7 summons!
          </Text>
        </View>
        <View style={ui.row}>
          <View style={[ui.column, ui.flex]}>
            <Button
              label="Summon ×1"
              tone="quiet"
              onPress={() =>
                notify(
                  "Preview summon: Quill of Wisdom (Epic). Tidak ada currency yang dipotong.",
                )
              }
            />
            <Text style={[ui.label, { textAlign: "center" }]}>
              100 Gems or 1,000 Gold
            </Text>
          </View>
          <View style={[ui.column, ui.flex]}>
            <Button
              label="Summon ×10"
              tone="gold"
              onPress={() =>
                notify(
                  "Preview ×10 summon. Summoning dan pembelian belum terhubung ke backend.",
                )
              }
            />
            <Text style={[ui.label, { textAlign: "center" }]}>
              900 Gems · Save 10%
            </Text>
          </View>
        </View>
      </Panel>
    </View>
  );
}
