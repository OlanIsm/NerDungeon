import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { mapArt } from "../assets";
import { Badge, Icon } from "../components/GameUI";
import {
  RealmFrame,
  RealmButton,
  fantasy,
  realm,
} from "../components/FantasyUI";
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
}: {
  onSelect: (expedition: Expedition) => void;
}) {
  return (
    <View style={s.list}>
      <View style={s.pageHeading}>
        <Text style={s.heading}>Your Expeditions</Text>
        <Text style={s.intro}>
          Choose a study scroll and continue its quest.
        </Text>
      </View>
      {expeditions.map((expedition) => (
        <ExpeditionCard
          key={expedition.title}
          expedition={expedition}
          onPress={() => onSelect(expedition)}
        />
      ))}
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
      style={({ pressed }) => [s.expeditionCard, pressed && s.pressed]}
    >
      <View pointerEvents="none" style={s.cardInset} />
      <View style={ui.flex}>
        <Text style={s.cardTitle}>{expedition.title}</Text>
        <Text numberOfLines={1} style={s.fileName}>
          {expedition.file}
        </Text>
        <View style={s.cardMeta}>
          <Text style={s.progress}>{expedition.progress}% cleared</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={25} color={realm.gold} />
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
  const regionArt = [mapArt.desert, mapArt.volcano, mapArt.kingdom];
  const regionPositions = [s.mapRegion1, s.mapRegion2, s.mapRegion3];

  return (
    <ImageBackground
      source={mapArt.background}
      resizeMode="contain"
      style={s.fullPage}
    >
      <BackButton onPress={onBack} />
      <View style={s.regionHeader}>
        <Text style={s.eyebrow}>EXPEDITION</Text>
        <Text numberOfLines={2} style={s.regionHeading}>
          {expedition.title}
        </Text>
        <Text style={s.regionHint}>Choose a region to explore</Text>
      </View>
      <View style={s.mapStage}>
        {expedition.regions.map((region, index) => (
          <Pressable
            key={region.chapter}
            accessibilityRole="button"
            accessibilityLabel={`Open Chapter ${region.chapter}: ${region.title}`}
            onPress={() => onSelect(region)}
            style={({ pressed }) => [
              s.mapRegion,
              regionPositions[index],
              pressed && s.pressed,
            ]}
          >
            <Image
              source={regionArt[index]}
              resizeMode="contain"
              style={s.mapRegionImage}
            />
            <View
              style={[
                s.mapLabel,
                index === 1 ? s.mapLabelRight : s.mapLabelLeft,
              ]}
            >
              <Text style={s.mapChapter}>CHAPTER {region.chapter}</Text>
              <Text numberOfLines={2} style={s.mapTitle}>
                {region.title}
              </Text>
              <Text style={s.mapMeta}>{region.questions} questions</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ImageBackground>
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
  return (
    <ScrollView
      contentContainerStyle={s.detailPage}
      showsVerticalScrollIndicator={false}
    >
      <BackButton onPress={onBack} />
      <View style={s.detailTitle}>
        <Text style={s.eyebrow}>{expedition.title}</Text>
        <Text style={s.detailHeading}>
          Chapter {region.chapter}: {region.title}
        </Text>
      </View>
      <Image
        source={
          [mapArt.desert, mapArt.volcano, mapArt.kingdom][region.chapter - 1]
        }
        resizeMode="contain"
        style={{ width: "100%", height: 190 }}
      />
      <RealmFrame>
        <Text style={s.summaryLabel}>REGION BRIEFING</Text>
        <Text style={s.summary}>{region.summary}</Text>
        <View style={s.topicList}>
          {region.topics.map((topic, index) => (
            <View key={topic} style={s.topicRow}>
              <View style={s.topicNumber}>
                <Text style={s.topicNumberText}>{index + 1}</Text>
              </View>
              <Text style={s.topicText}>{topic}</Text>
            </View>
          ))}
        </View>
        <View style={s.encounterMeta}>
          <Badge text={`${region.questions} QUESTIONS`} icon="help-circle" />
          <Badge text={`${region.enemies} ENEMIES`} icon="sword-cross" />
        </View>
      </RealmFrame>
      <View style={s.readyBlock}>
        <Text style={s.readyTitle}>Are you ready?</Text>
        <Text style={s.readyCopy}>Your answers decide every encounter.</Text>
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
      <Icon name="arrow-left" color={colors.wood} size={24} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  list: { gap: 14 },
  pageHeading: { paddingHorizontal: 8, paddingVertical: 10, gap: 4 },
  eyebrow: {
    fontFamily: fonts.heading,
    fontSize: 11,
    letterSpacing: 1.4,
    color: "#795029",
  },
  heading: { ...fantasy.title },
  intro: { ...fantasy.body },
  expeditionCard: {
    minHeight: 108,
    backgroundColor: "#fff0cf",
    borderWidth: 2,
    borderColor: "#967047",
    borderBottomWidth: 5,
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  cardInset: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderWidth: 1,
    borderColor: "#604a35",
    borderRadius: 4,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    lineHeight: 23,
    color: realm.ink,
  },
  fileName: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 11,
    color: realm.muted,
  },
  cardMeta: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progress: { fontFamily: fonts.heading, fontSize: 10, color: realm.gold },
  fullPage: { flex: 1, padding: 14, paddingTop: 70, overflow: "hidden" },
  back: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#8e541c",
    backgroundColor: "#e6c58a",
  },
  regionHeader: {
    alignSelf: "center",
    width: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#fff1d9f2",
    borderWidth: 2,
    borderColor: "#8e541c",
  },
  regionHeading: {
    fontFamily: fonts.heavy,
    fontSize: 17,
    color: colors.wood,
    textAlign: "center",
  },
  regionHint: {
    marginTop: 5,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
  },
  mapStage: { flex: 1, marginTop: 4 },
  mapRegion: {
    position: "absolute",
    left: "1%",
    right: "1%",
    height: "36%",
  },
  mapRegion1: { top: "0%" },
  mapRegion2: { top: "29%" },
  mapRegion3: { top: "59%" },
  mapRegionImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  mapLabel: {
    position: "absolute",
    top: "38%",
    width: "48%",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 4,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: "#6f421f",
    backgroundColor: "#fff0cff2",
  },
  mapLabelLeft: { left: "11%" },
  mapLabelRight: { right: "8%" },
  mapChapter: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: "#795029",
    letterSpacing: 1,
  },
  mapTitle: {
    marginTop: 2,
    fontFamily: fonts.heavy,
    fontSize: 15,
    color: colors.wood,
  },
  mapMeta: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.ink,
  },
  detailPage: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 86,
    paddingBottom: 36,
    gap: 18,
  },
  detailTitle: { gap: 5, paddingHorizontal: 6 },
  detailHeading: {
    fontFamily: fonts.heavy,
    fontSize: 25,
    lineHeight: 31,
    color: realm.ink,
  },
  detailCard: { minHeight: 390, padding: 38, gap: 14 },
  summaryLabel: {
    fontFamily: fonts.heading,
    fontSize: 11,
    letterSpacing: 1.3,
    color: "#795029",
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: realm.ink,
  },
  topicList: { gap: 11, marginTop: 3 },
  topicRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  topicNumber: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#775335",
  },
  topicNumberText: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.white,
  },
  topicText: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 13,
    color: realm.ink,
  },
  encounterMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  readyBlock: { alignItems: "center", gap: 7 },
  readyTitle: { fontFamily: fonts.heading, fontSize: 22, color: realm.ink },
  readyCopy: { ...fantasy.body },
  startButton: { width: "78%", marginTop: 8 },
});
