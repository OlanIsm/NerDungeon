import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { art } from "../assets";
import { Badge, Button, Icon, Meter, Panel, Tabs } from "../components/GameUI";
import { inventory } from "../data/inventory";
import { colors, ui } from "../theme";
import type { ScreenProps } from "../types";

export function InventoryScreen({ notify }: ScreenProps) {
  const [category, setCategory] = useState("Equipment");
  const [selected, setSelected] = useState(inventory[4]);
  const [equipped, setEquipped] = useState<string>();
  return (
    <View style={{ gap: 16 }}>
      <Panel>
        <View style={ui.row}>
          <Image
            source={art.avatar}
            style={{ width: 48, height: 48, borderRadius: 8 }}
          />
          <View style={ui.flex}>
            <Text style={ui.heading}>Nerd Mage</Text>
            <Text style={ui.label}>Scholar Class • Arcane Library</Text>
          </View>
          <View>
            <Text style={ui.label}>RATING</Text>
            <Badge text="1,420" icon="lightning-bolt" />
          </View>
        </View>
        <View style={ui.between}>
          <Text style={ui.label}>Vigor HP</Text>
          <Text style={ui.label}>850 / 850</Text>
        </View>
        <Meter value={100} color="#29802a" />
        <View style={ui.between}>
          <Text style={ui.label}>Trivia MP</Text>
          <Text style={ui.label}>320 / 320</Text>
        </View>
        <Meter value={100} />
        <View style={ui.row}>
          {[
            { image: art.cap, name: "Scholar Cap" },
            { image: art.staff, name: "Quill Staff" },
            { image: art.noviceRobe, name: "Novice Robe" },
            { image: art.amulet, name: "Mem. Amulet" },
          ].map((item, index) => (
            <View
              key={item.name}
              style={[
                ui.flex,
                ui.center,
                {
                  backgroundColor: index === 3 ? colors.mint : "#fff2d9",
                  padding: 5,
                  borderRadius: 6,
                  gap: 5,
                },
              ]}
            >
              <Text style={ui.label}>{["I", "II", "III", "IV"][index]}</Text>
              <Image source={item.image} style={{ width: 38, height: 38 }} />
              <Text style={[ui.label, { fontSize: 9, textAlign: "center" }]}>
                {item.name}
              </Text>
            </View>
          ))}
        </View>
        <View style={ui.row}>
          {[
            ["Quiz ATK", "185 +28"],
            ["Ward DEF", "42 +6"],
            ["Free Clues", "2 /run"],
          ].map(([label, value]) => (
            <View key={label} style={[ui.inset, ui.flex, { padding: 9 }]}>
              <Text style={ui.label}>{label}</Text>
              <Text style={ui.title}>{value}</Text>
            </View>
          ))}
        </View>
      </Panel>
      <Panel>
        <Tabs
          values={["Equipment", "Spells", "Potions"]}
          selected={category}
          onChange={setCategory}
        />
        <View style={ui.between}>
          <Text style={ui.label}>24/40</Text>
          <Button
            label="Expand"
            icon="plus"
            tone="quiet"
            onPress={() =>
              notify("Haversack expansion preview. Kapasitas belum berubah.")
            }
          />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {inventory
            .filter(
              (item) => category === "Equipment" || item.category === category,
            )
            .map((item) => (
              <Pressable
                key={item.name}
                accessibilityRole="button"
                accessibilityLabel={item.name}
                accessibilityState={{ selected: selected.name === item.name }}
                onPress={() => setSelected(item)}
                style={{
                  width: "23%",
                  minHeight: 76,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  backgroundColor:
                    selected.name === item.name ? colors.mint : colors.inset,
                  borderWidth: selected.name === item.name ? 2 : 0,
                  borderColor: colors.teal,
                  borderBottomWidth: 3,
                  borderBottomColor: colors.edge,
                  borderRadius: 10,
                }}
              >
                <Icon
                  name={item.icon}
                  size={25}
                  color={
                    selected.name === item.name ? colors.teal : colors.wood
                  }
                />
                <Text style={[ui.label, { fontSize: 10 }]}>{item.short}</Text>
                <Text style={[ui.label, { fontSize: 9 }]}>{item.level}</Text>
              </Pressable>
            ))}
        </View>
      </Panel>
      <Panel>
        <View style={ui.row}>
          <View
            style={{
              backgroundColor: colors.mint,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Icon name={selected.icon} color={colors.teal} size={28} />
          </View>
          <View style={ui.flex}>
            <Text style={ui.title}>{selected.name}</Text>
            <Text style={ui.label}>
              {selected.category === "Equipment"
                ? "EPIC RELIC HEAD · 500 Gold"
                : selected.category}
            </Text>
          </View>
          <Badge text="RANK S" />
        </View>
        <View style={ui.inset}>
          <Text style={ui.label}>Passive Effect: Deductive Focus</Text>
          <Text style={ui.body}>{selected.description}</Text>
        </View>
        <View style={ui.row}>
          {[
            ["Mana Max", "+35 MP"],
            ["Think Time", "+3.5s"],
            ["Crit Clue", "+12%"],
          ].map(([label, value]) => (
            <View
              key={label}
              style={[ui.inset, ui.flex, ui.center, { padding: 8 }]}
            >
              <Text style={ui.label}>{label}</Text>
              <Text style={ui.title}>{value}</Text>
            </View>
          ))}
        </View>
        <Button
          label={
            equipped === selected.name
              ? "Equipped"
              : selected.category === "Equipment"
                ? "Equip Item"
                : "Use Item"
          }
          icon="check-circle-outline"
          tone="gold"
          onPress={() => {
            setEquipped(selected.name);
            notify(`${selected.name} dipilih untuk preview loadout.`);
          }}
        />
        <View style={ui.row}>
          <Button
            label="Upgrade (250g)"
            icon="upload"
            style={ui.flex}
            onPress={() => notify("Upgrade preview. Gold tidak dipotong.")}
          />
          <Button
            label="Sell · 50g"
            tone="quiet"
            onPress={() =>
              notify("Selling preview. Item tetap ada di inventory.")
            }
          />
        </View>
      </Panel>
    </View>
  );
}
