import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Button,
  Icon,
  Meter,
  Tabs,
  useReducedMotion,
} from "../components/GameUI";
import { art } from "../assets";
import { inventory, type Item } from "../data/inventory";
import { colors, fonts, ui } from "../theme";
import type { ScreenProps } from "../types";

type Category = "Equipment" | "Potions";

const loadout = [
  { item: inventory[17], label: "Accessory" },
  { item: inventory[8], label: "Weapon" },
  { item: inventory[0], label: "Armor" },
  { item: inventory[16], label: "Accessory" },
];

export function InventoryScreen({ notify }: ScreenProps) {
  const scroll = useRef<ScrollView>(null);
  const bagY = useRef(0);
  const reducedMotion = useReducedMotion();
  const [category, setCategory] = useState<Category>("Equipment");
  const [selected, setSelected] = useState<string>();
  const items = inventory.filter((item) => item.category === category);
  const selectedItem = items.find((item) => item.name === selected);
  function inspectItem(item: Item) {
    setCategory(item.category);
    setSelected(item.name);
    requestAnimationFrame(() =>
      scroll.current?.scrollTo({ y: bagY.current, animated: !reducedMotion }),
    );
  }

  return (
    <ScrollView
      ref={scroll}
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <Text style={ui.hero}>The Armory</Text>
      </View>

      <View accessibilityLabel="Bag profile panel" style={styles.profile}>
        <View style={styles.characterRow}>
          {[0, 1, 2].map((column) =>
            column === 1 ? (
              <View key="character" style={styles.characterStage}>
                <View pointerEvents="none" style={styles.characterBackdrop} />
                <View pointerEvents="none" style={styles.characterGround} />
                <Image
                  accessible
                  accessibilityLabel="Nerd Mage character"
                  source={art.character}
                  resizeMode="contain"
                  style={styles.characterImage}
                />
              </View>
            ) : (
              <View key={column} style={styles.equipmentColumn}>
                {loadout.slice(column, column + 2).map(({ item, label }) => (
                  <View key={item.name} style={styles.equipmentEntry}>
                    <InventorySlot
                      item={item}
                      label={label + ": " + item.name}
                      equipped
                      selected={selected === item.name}
                      onPress={() => inspectItem(item)}
                    />
                    <Text style={styles.slotCaption}>{label}</Text>
                  </View>
                ))}
              </View>
            ),
          )}
        </View>

        <View style={styles.vitals}>
          {(
            [
              { name: "HP", value: "850/850", icon: "heart", color: "#b9574b" },
              { name: "MP", value: "320/320", icon: "water", color: "#497f91" },
            ] as const
          ).map((meter) => (
            <View key={meter.name} style={styles.meterBox}>
              <View style={styles.meterHeading}>
                <Icon name={meter.icon} size={15} color={meter.color} />
                <Text style={styles.statLabel}>{meter.name}</Text>
                <Text style={styles.meterValue}>{meter.value}</Text>
              </View>
              <Meter value={100} color={meter.color} />
            </View>
          ))}
        </View>
        <View style={styles.stats}>
          {(
            [
              { label: "Quiz ATK", value: "185 +28", icon: "sword-cross" },
              { label: "Ward DEF", value: "42 +6", icon: "shield-outline" },
              {
                label: "Free Clues",
                value: "2 /run",
                icon: "lightbulb-outline",
              },
            ] as const
          ).map((stat) => (
            <View
              key={stat.label}
              accessibilityLabel={stat.label + " stat"}
              style={styles.statTile}
            >
              <View style={ui.row}>
                <Icon name={stat.icon} size={17} color={colors.wood} />
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
              <Text style={styles.meta}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View
        accessibilityLabel="Bag inventory panel"
        style={styles.bag}
        onLayout={(event) => {
          bagY.current = event.nativeEvent.layout.y;
        }}
      >
        <View style={styles.bagHeading}>
          <Text style={[styles.sectionTitle, ui.flex]}>Backpack</Text>
          <Text style={styles.capacity}>24/40</Text>
          <Button
            label="Expand"
            icon="plus"
            tone="quiet"
            style={styles.expand}
            onPress={() =>
              notify("Bag expansion preview. Kapasitas belum berubah.")
            }
          />
        </View>
        <Tabs
          values={["Equipment", "Potions"] as const}
          selected={category}
          onChange={(value) => {
            setCategory(value);
            setSelected(undefined);
          }}
        />
        {selectedItem && (
          <View
            accessibilityLabel="Selected item details"
            accessibilityLiveRegion="polite"
            style={styles.inspector}
          >
            <>
              <Image
                source={selectedItem.image}
                resizeMode="contain"
                style={styles.inspectorImage}
              />
              <View style={styles.inspectorText}>
                <Text style={ui.title}>{selectedItem.name}</Text>
                <Text style={styles.meta}>
                  {selectedItem.category}
                  {loadout.some(({ item }) => item === selectedItem)
                    ? " · In current loadout"
                    : ""}
                </Text>
                <Text style={ui.body}>Item preview</Text>
              </View>
            </>
          </View>
        )}
        <View accessibilityLabel="Bag items" style={styles.itemsGrid}>
          {items.map((item) => (
            <View key={item.name} style={styles.slotCell}>
              <InventorySlot
                item={item}
                equipped={loadout.some((slot) => slot.item === item)}
                selected={selected === item.name}
                onPress={() => inspectItem(item)}
              />
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          <Icon name="check-circle" size={15} color={colors.teal} />
          <Text style={styles.meta}>In current loadout</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function InventorySlot({
  item,
  label = item.name,
  selected,
  equipped,
  onPress,
}: {
  item: Item;
  label?: string;
  selected: boolean;
  equipped?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        equipped
          ? "In current loadout. View item details."
          : "View item details."
      }
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.itemSlot,
        selected && styles.selectedSlot,
        pressed && styles.pressedSlot,
      ]}
    >
      <View pointerEvents="none" style={styles.slotStitch} />
      <Image
        source={item.image}
        resizeMode="contain"
        style={styles.itemImage}
      />
      {equipped && (
        <View pointerEvents="none" style={styles.equippedMark}>
          <Icon name="check" size={12} color={colors.white} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 28, gap: 18 },
  heading: { gap: 4, paddingHorizontal: 3, paddingTop: 8 },
  sectionTitle: { ...ui.heading, fontSize: 19 },
  profile: {
    padding: 12,
    gap: 12,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.edge,
    borderRadius: 24,
    borderTopLeftRadius: 14,
    backgroundColor: "#dce7cc",
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
  },
  characterRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  equipmentColumn: { width: 62, gap: 8 },
  equipmentEntry: { gap: 4 },
  slotCaption: {
    fontFamily: fonts.heading,
    fontSize: 11,
    lineHeight: 15,
    color: colors.wood,
    textAlign: "center",
  },
  characterStage: {
    flex: 1,
    height: 174,
    alignItems: "center",
    justifyContent: "center",
  },
  characterBackdrop: {
    position: "absolute",
    width: "98%",
    maxWidth: 185,
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: "#c5d6b4",
    borderWidth: 1,
    borderColor: "#abc29a",
  },
  characterGround: {
    position: "absolute",
    bottom: 7,
    width: "80%",
    height: 18,
    borderRadius: 100,
    backgroundColor: "#aabd95",
  },
  characterImage: { width: "100%", maxWidth: 192, height: 170 },
  vitals: { flexDirection: "row", gap: 12 },
  meterBox: { flex: 1, gap: 6 },
  meterHeading: { flexDirection: "row", alignItems: "center", gap: 4 },
  statLabel: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.ink,
  },
  meterValue: { fontFamily: fonts.heading, fontSize: 11, color: colors.ink },
  stats: {
    flexDirection: "row",
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#bac8a7",
    gap: 6,
  },
  statTile: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
  bag: {
    padding: 12,
    gap: 12,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.edge,
    borderRadius: 16,
    borderTopRightRadius: 25,
    backgroundColor: colors.parchment,
  },
  bagHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  capacity: { fontFamily: fonts.heading, fontSize: 11, color: colors.muted },
  expand: { paddingHorizontal: 8, minHeight: 48 },
  inspector: {
    minHeight: 102,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.inset,
    borderRadius: 12,
  },
  inspectorImage: { width: 46, height: 60 },
  inspectorText: { flex: 1, gap: 3 },
  itemsGrid: { flexDirection: "row", flexWrap: "wrap", margin: -4 },
  slotCell: { width: "25%", padding: 4 },
  itemSlot: {
    width: "100%",
    aspectRatio: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: "#9c835e",
    borderRadius: 13,
    backgroundColor: "#f3e5c6",
  },
  slotStitch: {
    position: "absolute",
    top: 4,
    right: 4,
    bottom: 4,
    left: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#c3aa7b",
    borderRadius: 7,
  },
  itemImage: { width: "80%", height: "80%" },
  selectedSlot: { borderColor: colors.teal, backgroundColor: "#d6e6d1" },
  pressedSlot: { transform: [{ translateY: 2 }] },
  equippedMark: {
    position: "absolute",
    right: 3,
    bottom: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.teal,
  },
  legend: { flexDirection: "row", alignItems: "center", gap: 5 },
});
