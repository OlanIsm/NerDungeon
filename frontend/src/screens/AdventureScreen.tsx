import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { mapArt } from "../assets";
import { Badge, Button, Icon, Meter } from "../components/GameUI";
import {
  AdventurePath,
  chapterState,
  currentChapter,
} from "../components/AdventurePath";
import { RealmFrame, RealmButton, fantasy } from "../components/FantasyUI";
import { colors, fonts, ui } from "../theme";

export type Region = {
  chapter: number;
  title: string;
  summary: string;
  topics: string[];
  questions: number;
  enemies: number;
};
export type Expedition = {
  title: string;
  file: string;
  progress: number;
  regions: Region[];
};

const regions = (topics: string[]): Region[] =>
  topics.slice(0, 3).map((title, index) => ({
    chapter: index + 1,
    title,
    summary: `Kuasai konsep inti ${title.toLowerCase()} sebelum menghadapi encounter di akhir region.`,
    topics: [
      `Konsep dasar ${title}`,
      "Penerapan dan contoh penting",
      "Kesalahan umum yang harus dihindari",
    ],
    questions: 10,
    enemies: index + 1,
  }));

export const expeditions: Expedition[] = [
  {
    title: "Biologi — Fotosintesis",
    file: "Fotosintesis_Lengkap_Revisi.pdf",
    progress: 33,
    regions: regions(["Reaksi Terang", "Siklus Calvin", "Metabolisme"]),
  },
  {
    title: "Fisika Dasar — Gravitasi",
    file: "Fisika_Dasar.pdf",
    progress: 0,
    regions: regions(["Gaya Gravitasi", "Medan Gravitasi", "Orbit"]),
  },
  {
    title: "SOLID Principles",
    file: "SOLID.pdf",
    progress: 66,
    regions: regions([
      "Single Responsibility",
      "Open–Closed Principle",
      "Dependency Inversion",
    ]),
  },
  {
    title: "Object-Oriented Programming",
    file: "OOP_Fundamentals.pdf",
    progress: 0,
    regions: regions(["Encapsulation", "Inheritance", "Polymorphism"]),
  },
];

export function AdventureScreen({
  onSelect,
  onInspect,
}: {
  onSelect: (expedition: Expedition, region?: Region) => void;
  onInspect: () => void;
}) {
  const [active, setActive] = useState(0);
  const [chapter, setChapter] = useState(
    currentChapter(expeditions[0].progress, expeditions[0].regions.length),
  );
  const expedition = expeditions[active];
  const selectedRegion = expedition.regions[chapter];
  return (
    <View style={s.page}>
      <View style={s.pageHeading}>
        <Text style={fantasy.title}>Your Expeditions</Text>
        <Text style={fantasy.body}>
          A chapter at a time. A little further every day.
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollChoices}
        accessibilityLabel="Choose study material"
      >
        {expeditions.map((item, index) => (
          <Pressable
            key={item.file}
            accessibilityRole="button"
            accessibilityLabel={`Select ${item.title}`}
            accessibilityState={{ selected: active === index }}
            onPress={() => {
              setActive(index);
              setChapter(currentChapter(item.progress, item.regions.length));
            }}
            style={[s.scrollChoice, active === index && s.activeChoice]}
          >
            <Icon
              name="book-open-page-variant-outline"
              size={21}
              color={active === index ? colors.parchment : colors.teal}
            />
            <Text
              numberOfLines={2}
              style={[
                s.choiceText,
                active === index && { color: colors.parchment },
              ]}
            >
              {item.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${expedition.title}`}
        onPress={() => onSelect(expedition)}
        style={s.expeditionHeading}
      >
        <View style={ui.flex}>
          <Text style={s.expeditionTitle}>{expedition.title}</Text>
          <Text numberOfLines={1} style={ui.label}>
            {expedition.file}
          </Text>
        </View>
        <View style={s.progressSeal}>
          <Text style={s.progressSealText}>{expedition.progress}%</Text>
          <Text style={s.sealLabel}>cleared</Text>
        </View>
      </Pressable>
      <AdventurePath
        chapters={expedition.regions}
        progress={expedition.progress}
        selected={selectedRegion.chapter}
        onSelect={(region) => {
          setChapter(
            expedition.regions.findIndex(
              (item) => item.chapter === region.chapter,
            ),
          );
          onInspect();
        }}
      />
      <RealmFrame style={s.selectedChapter}>
        <View style={ui.between}>
          <Badge
            text={`Chapter ${selectedRegion.chapter}`}
            icon="flag-variant"
          />
          <Text style={s.stateText}>
            {chapterState(
              expedition.progress,
              expedition.regions.length,
              chapter,
            )}
          </Text>
        </View>
        <Text style={ui.heading}>{selectedRegion.title}</Text>
        <Text style={ui.body}>{selectedRegion.summary}</Text>
        <Text style={ui.label}>
          {selectedRegion.questions} questions · {selectedRegion.enemies}{" "}
          encounters
        </Text>
        <Button
          label="View chapter"
          icon="arrow-right"
          tone="gold"
          onPress={() => onSelect(expedition, selectedRegion)}
        />
      </RealmFrame>
    </View>
  );
}

export function ExpeditionCard({
  expedition,
  onPress,
}: {
  expedition: Expedition;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${expedition.title}`}
      onPress={onPress}
      style={({ pressed }) => [s.material, pressed && s.pressed]}
    >
      <View pointerEvents="none" style={s.fold} />
      <View style={s.document}>
        <Icon name="file-document-outline" size={26} color={colors.wood} />
      </View>
      <View style={s.materialCopy}>
        <Text style={s.materialTitle}>{expedition.title}</Text>
        <Text numberOfLines={1} style={s.fileName}>
          {expedition.file}
        </Text>
        <View style={ui.row}>
          <Text style={s.fileName}>{expedition.regions.length} chapters</Text>
          <View style={ui.flex}>
            <Meter value={expedition.progress} />
          </View>
          <Text style={s.materialProgress}>{expedition.progress}%</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={22} color={colors.teal} />
    </Pressable>
  );
}

export function RegionScreen({
  expedition,
  onBack,
  onSelect,
}: {
  expedition: Expedition;
  onBack: () => void;
  onSelect: (region: Region) => void;
}) {
  const current = currentChapter(
    expedition.progress,
    expedition.regions.length,
  );
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.regionPage}
    >
      <View style={s.backHeading}>
        <BackButton onPress={onBack} />
        <View style={ui.flex}>
          <Text style={s.regionTitle}>{expedition.title}</Text>
          <Text style={ui.body}>Choose your next chapter</Text>
        </View>
      </View>
      <Meter
        value={expedition.progress}
        label={`${expedition.progress}% of this expedition cleared`}
      />
      <AdventurePath
        chapters={expedition.regions}
        progress={expedition.progress}
        selected={expedition.regions[current].chapter}
        onSelect={(chapter) => {
          const region = expedition.regions.find(
            (item) => item.chapter === chapter.chapter,
          );
          if (region) onSelect(region);
        }}
      />
      <View style={s.mapLegend}>
        <View style={ui.row}>
          <Icon name="check-circle" size={18} color={colors.teal} />
          <Text style={ui.label}>Completed</Text>
        </View>
        <View style={ui.row}>
          <Icon name="flag-variant" size={18} color={colors.wood} />
          <Text style={ui.label}>Current</Text>
        </View>
        <View style={ui.row}>
          <Icon name="circle-outline" size={18} color={colors.muted} />
          <Text style={ui.label}>Available</Text>
        </View>
      </View>
      <Text style={s.mapHint}>
        Every stop holds a new idea. Tap a chapter to see its topics.
      </Text>
    </ScrollView>
  );
}

export function RegionDetailScreen({
  expedition,
  region,
  onBack,
  onStart,
}: {
  expedition: Expedition;
  region: Region;
  onBack: () => void;
  onStart: () => void;
}) {
  const index = expedition.regions.findIndex(
    (item) => item.chapter === region.chapter,
  );
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.detailPage}
    >
      <View style={s.backHeading}>
        <BackButton onPress={onBack} />
        <View style={ui.flex}>
          <Text style={ui.body}>{expedition.title}</Text>
          <Text style={s.detailTitle}>
            Chapter {region.chapter}: {region.title}
          </Text>
        </View>
      </View>
      <View style={s.regionShowcase}>
        <View pointerEvents="none" style={s.regionGround} />
        <Image
          source={[mapArt.desert, mapArt.volcano, mapArt.kingdom][index]}
          resizeMode="contain"
          style={s.regionImage}
        />
        <Badge
          text={chapterState(
            expedition.progress,
            expedition.regions.length,
            index,
          )}
          icon="flag-variant"
        />
      </View>
      <RealmFrame>
        <Text style={ui.heading}>Your quest</Text>
        <Text style={ui.body}>{region.summary}</Text>
        <View style={s.topics}>
          {region.topics.map((topic, i) => (
            <View key={topic} style={s.topic}>
              <View style={s.topicNumber}>
                <Text style={s.topicNumberText}>{i + 1}</Text>
              </View>
              <Text style={s.topicText}>{topic}</Text>
            </View>
          ))}
        </View>
        <View style={s.encounterMeta}>
          <Badge
            text={`${region.questions} questions`}
            icon="help-circle-outline"
          />
          <Badge text={`${region.enemies} enemies`} icon="sword-cross" />
        </View>
      </RealmFrame>
      <View style={s.readyBlock}>
        <Text style={s.readyTitle}>A new discovery awaits.</Text>
        <Text style={fantasy.body}>Your answers decide every encounter.</Text>
        <RealmButton
          label="Start Adventure"
          icon="sword-cross"
          onPress={onStart}
        />
      </View>
    </ScrollView>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      style={({ pressed }) => [s.back, pressed && s.pressed]}
    >
      <Icon name="arrow-left" color={colors.ink} size={24} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  page: { gap: 16 },
  pageHeading: { gap: 4 },
  scrollChoices: { gap: 8, paddingVertical: 3, paddingRight: 12 },
  scrollChoice: {
    width: 156,
    minHeight: 58,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: "#b4a481",
    borderRadius: 12,
    backgroundColor: colors.parchment,
  },
  activeChoice: { backgroundColor: colors.teal, borderColor: colors.edge },
  choiceText: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink,
  },
  expeditionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 70,
  },
  expeditionTitle: {
    fontFamily: fonts.heading,
    fontSize: 19,
    lineHeight: 26,
    color: colors.ink,
    marginBottom: 4,
  },
  progressSeal: {
    minWidth: 61,
    minHeight: 61,
    borderWidth: 2,
    borderColor: "#b8a279",
    backgroundColor: "#f5e7bb",
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  progressSealText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.wood,
  },
  sealLabel: { fontFamily: fonts.label, fontSize: 10, color: colors.muted },
  selectedChapter: { gap: 10 },
  stateText: { ...ui.label, color: colors.teal },
  material: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: "#b7a27b",
    backgroundColor: colors.parchment,
    borderRadius: 12,
    borderTopRightRadius: 3,
    overflow: "hidden",
  },
  document: {
    width: 36,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: colors.inset,
  },
  materialCopy: { flex: 1, minWidth: 0, gap: 5 },
  materialTitle: {
    fontFamily: fonts.heading,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  fileName: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
  },
  materialProgress: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.teal,
  },
  fold: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 13,
    height: 13,
    backgroundColor: colors.inset,
    borderBottomLeftRadius: 8,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#b7a27b",
  },
  pressed: { transform: [{ translateY: 2 }] },
  regionPage: { padding: 16, paddingTop: 24, paddingBottom: 32, gap: 22 },
  backHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.parchment,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.edge,
    borderRadius: 14,
  },
  regionTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
  },
  mapLegend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  mapHint: { ...ui.body, textAlign: "center", paddingHorizontal: 18 },
  detailPage: { padding: 16, paddingTop: 24, paddingBottom: 32, gap: 20 },
  detailTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 29,
    color: colors.ink,
    marginTop: 4,
  },
  regionShowcase: { alignItems: "center" },
  regionGround: {
    position: "absolute",
    bottom: 21,
    width: "80%",
    height: 90,
    borderRadius: 100,
    backgroundColor: colors.sage,
  },
  regionImage: { width: "100%", maxWidth: 330, height: 190 },
  topics: { gap: 12, marginTop: 4 },
  topic: { flexDirection: "row", alignItems: "center", gap: 10 },
  topicNumber: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#adb99a",
  },
  topicNumberText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.teal,
  },
  topicText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
  },
  encounterMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  readyBlock: { gap: 10, alignItems: "center" },
  readyTitle: {
    fontFamily: fonts.heading,
    fontSize: 21,
    lineHeight: 28,
    color: colors.ink,
    textAlign: "center",
  },
});
