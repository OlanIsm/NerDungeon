import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { gui, miniIcons } from "../assets";
import { Icon } from "../components/GameUI";
import { NineSliceFrame } from "../components/NineSliceFrame";
import { inventory } from "../data/inventory";
import { colors, fonts } from "../theme";
import type { ScreenProps } from "../types";

type Category = "Equipment" | "Potions";

export function InventoryScreen({ notify }: ScreenProps) {
  const [category, setCategory] = useState<Category>("Equipment");
  const [selected, setSelected] = useState<string>();
  const items = inventory.filter((item) => item.category === category);
  const equipped = [inventory[17], inventory[8], inventory[0], inventory[16]];

  return (
    <View style={styles.screen}>
      <View accessibilityLabel="Bag profile panel" style={styles.profile}>
        <NineSliceFrame images={gui.bagTop9} top={40} bottom={40} side={40} />
        <View style={styles.vitals}>
          {[
            { name: "HP", value: "850/850", icon: miniIcons.heart, fill: styles.hpFill },
            { name: "MP", value: "320/320", icon: miniIcons.water, fill: styles.mpFill },
          ].map((meter) => (
            <View key={meter.name} style={styles.meterBox}>
              <View style={styles.statRow}>
                <Image source={meter.icon} resizeMode="contain" style={styles.vitalIcon} />
                <Text style={styles.statLabel}>{meter.name}</Text>
                <Text style={styles.statValue}>{meter.value}</Text>
              </View>
              <View style={styles.meterTrack}><View style={meter.fill} /></View>
            </View>
          ))}
        </View>
        <View style={styles.profileBody}>
          <View style={styles.stats}>
            {[
              { label: "Quiz ATK", value: "185 +28", icon: miniIcons.goldenSwords },
              { label: "Ward DEF", value: "42 +6", icon: miniIcons.shield },
              { label: "Free Clues", value: "2 /run", icon: miniIcons.clueBulb },
            ].map((stat) => (
              <View key={stat.label} accessibilityLabel={`${stat.label} stat`} style={styles.statTile}>
                <Image source={stat.icon} resizeMode="contain" style={styles.tileIcon} />
                <Text style={styles.tileLabel}>{stat.label}</Text>
                <Text style={styles.tileValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.character}>
            <View style={styles.equipmentColumn}>
              {equipped.slice(0, 2).map((item) => (
                <View key={item.name} style={styles.equipmentSlot}>
                  <Image source={item.image} resizeMode="contain" style={styles.equipmentImage} />
                  <Text numberOfLines={1} style={styles.slotName}>{item.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.characterPlaceholder}>
              <Icon name="account-outline" size={37} color="#8c6b43" />
              <Text style={styles.characterPlaceholderText}>Character art</Text>
            </View>
            <View style={styles.equipmentColumn}>
              {equipped.slice(2).map((item) => (
                <View key={item.name} style={styles.equipmentSlot}>
                  <Image source={item.image} resizeMode="contain" style={styles.equipmentImage} />
                  <Text numberOfLines={1} style={styles.slotName}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View accessibilityLabel="Bag inventory panel" style={styles.bag}>
        <NineSliceFrame images={gui.bagBottom9} top={40} bottom={40} side={40} />
        <View style={styles.tabs}>
          {(["Equipment", "Potions"] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityLabel={value}
              accessibilityState={{ selected: category === value }}
              onPress={() => { setCategory(value); setSelected(undefined); }}
              style={[styles.tab, category === value && styles.activeTab]}
            >
              <Image source={value === "Equipment" ? miniIcons.crossedSwords : miniIcons.hpPotion} resizeMode="contain" style={styles.tabIcon} />
              <Text style={[styles.tabText, category === value && styles.activeTabText]}>{value}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.bagHeading}>
          <View style={styles.bagTitle}>
            <Image source={miniIcons.chest} resizeMode="contain" style={styles.bagIcon} />
            <Text style={styles.bagTitleText}>Bag</Text>
          </View>
          <Text style={styles.capacity}>24/40</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Expand"
            onPress={() => notify("Bag expansion preview. Kapasitas belum berubah.")}
            style={styles.expand}
          >
            <Image source={miniIcons.healPlus} resizeMode="contain" style={styles.expandIcon} />
            <Text style={styles.expandText}>Expand</Text>
          </Pressable>
        </View>
        <ScrollView
          key={category}
          accessibilityLabel="Bag items"
          style={styles.itemsScroll}
          contentContainerStyle={styles.itemsGrid}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              accessibilityState={{ selected: selected === item.name }}
              onPress={() => setSelected(item.name)}
              style={[styles.itemSlot, selected === item.name && styles.selectedSlot]}
            >
              <Image source={item.image} resizeMode="contain" style={styles.itemImage} />
              <Text numberOfLines={3} style={styles.itemName}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 12, paddingBottom: 100, gap: 8 },
  profile: { height: 292, paddingHorizontal: 27, paddingTop: 31, paddingBottom: 29, gap: 7 },
  vitals: { height: 66, flexDirection: "row", gap: 8 },
  meterBox: { flex: 1, padding: 8, gap: 7, borderRadius: 10, backgroundColor: "#f7dfad", justifyContent: "center" },
  statRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  vitalIcon: { width: 25, height: 25 },
  statLabel: { flex: 1, fontFamily: fonts.heavy, fontSize: 12, color: "#513623" },
  statValue: { fontFamily: fonts.heavy, fontSize: 10, color: "#513623" },
  meterTrack: { height: 11, borderRadius: 8, borderWidth: 1, borderColor: "#68411b", backgroundColor: "#d0ba8f", overflow: "hidden" },
  hpFill: { height: "100%", width: "100%", backgroundColor: "#23b336" },
  mpFill: { height: "100%", width: "100%", backgroundColor: "#009eab" },
  profileBody: { flex: 1, flexDirection: "row", gap: 8 },
  stats: { width: "19%", alignItems: "center", justifyContent: "space-between", gap: 2 },
  statTile: { width: "100%", maxWidth: 52, aspectRatio: 1, padding: 2, justifyContent: "center", alignItems: "center", borderRadius: 7, backgroundColor: "#f4dbaa" },
  tileIcon: { width: 15, height: 15 },
  tileLabel: { fontFamily: fonts.heading, fontSize: 8, color: "#513623", textAlign: "center" },
  tileValue: { width: "100%", fontFamily: fonts.heavy, fontSize: 10, color: "#513623", textAlign: "center" },
  character: { flex: 1, flexDirection: "row", alignItems: "center", gap: 3 },
  equipmentColumn: { width: "30%", height: "100%", justifyContent: "space-around" },
  equipmentSlot: { height: "45%", alignItems: "center", justifyContent: "center", padding: 3, borderRadius: 8, borderWidth: 2, borderColor: "#d6b183", backgroundColor: "#f9e8ca" },
  equipmentImage: { width: "100%", height: "70%" },
  slotName: { fontFamily: fonts.heading, fontSize: 8, color: "#4b321e" },
  characterPlaceholder: { flex: 1, height: "72%", alignItems: "center", justifyContent: "center", borderRadius: 9, borderWidth: 2, borderStyle: "dashed", borderColor: "#c89d67", backgroundColor: "#fff0cf" },
  characterPlaceholderText: { fontFamily: fonts.heading, fontSize: 9, color: "#7d5b37", textAlign: "center" },
  bag: { flex: 1, minHeight: 0, paddingHorizontal: 27, paddingTop: 30, paddingBottom: 29 },
  tabs: { height: 48, flexDirection: "row", gap: 6 },
  tab: { flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, borderWidth: 2, borderColor: "#b88b56", backgroundColor: "#f5dfb6" },
  tabIcon: { width: 25, height: 25 },
  activeTab: { borderColor: "#9f5a13", backgroundColor: "#6c3c18" },
  tabText: { fontFamily: fonts.heavy, fontSize: 14, color: "#68431f" },
  activeTabText: { color: "#fff1ce" },
  bagHeading: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 8 },
  bagTitle: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  bagIcon: { width: 28, height: 28 },
  bagTitleText: { fontFamily: fonts.heavy, fontSize: 19, color: "#4e2b14" },
  capacity: { fontFamily: fonts.heavy, fontSize: 12, color: "#765538" },
  expand: { minHeight: 48, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 2, borderRadius: 10, borderWidth: 2, borderColor: "#cda675", backgroundColor: "#ffe4af" },
  expandIcon: { width: 19, height: 19 },
  expandText: { fontFamily: fonts.heavy, fontSize: 11, color: "#4e2b14" },
  itemsScroll: { flex: 1, minHeight: 0 },
  itemsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingBottom: 12 },
  itemSlot: { width: "23%", minHeight: 108, padding: 4, alignItems: "center", gap: 2, borderWidth: 2, borderBottomWidth: 4, borderColor: "#e6c18b", borderBottomColor: "#8c5c31", borderRadius: 11, backgroundColor: "#fff6df" },
  selectedSlot: { borderColor: colors.teal, backgroundColor: colors.mint },
  itemImage: { width: "90%", height: 65 },
  itemName: { fontFamily: fonts.heading, fontSize: 9, color: "#5a3a21", textAlign: "center" },
});
