import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { mapArt } from "../assets";
import { colors, fonts } from "../theme";
import { Icon } from "./GameUI";

type Chapter = { chapter: number; title: string; questions: number };
export function chapterState(progress: number, count: number, index: number) {
  const completed = Math.round((progress / 100) * count);
  return index < completed
    ? "Completed"
    : index === completed
      ? "Current"
      : "Available";
}
export function currentChapter(progress: number, count: number) {
  return Math.min(count - 1, Math.round((progress / 100) * count));
}

const regionArt = [mapArt.desert, mapArt.volcano, mapArt.kingdom];
export function AdventurePath({
  chapters,
  progress,
  selected,
  onSelect,
}: {
  chapters: Chapter[];
  progress: number;
  selected: number;
  onSelect: (chapter: Chapter) => void;
}) {
  const [width, setWidth] = useState(288);
  return (
    <View
      accessibilityLabel="Adventure path"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[s.map, { minHeight: chapters.length * 130 + 12 }]}
    >
      <View pointerEvents="none" style={s.landLeft} />
      <View pointerEvents="none" style={s.landRight} />
      {chapters.slice(1).map((chapter, index) => (
        <View
          key={chapter.chapter}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          {Array.from({ length: 15 }, (_, dot) => {
            const t = (dot + 1) / 16;
            const bend = t * t * (3 - 2 * t);
            const x =
              index % 2 === 0
                ? 49 + (width - 98) * bend
                : width - 49 - (width - 98) * bend;
            return (
              <View
                key={dot}
                style={[
                  s.pathDot,
                  { left: x - 3, top: 60 + index * 130 + t * 130 },
                ]}
              />
            );
          })}
        </View>
      ))}
      {chapters.map((chapter, index) => {
        const state = chapterState(progress, chapters.length, index);
        const active = selected === chapter.chapter;
        return (
          <Pressable
            key={chapter.chapter}
            accessibilityRole="button"
            accessibilityLabel={`Open Chapter ${chapter.chapter}: ${chapter.title}`}
            accessibilityHint={`${state}. ${chapter.questions} questions.`}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(chapter)}
            style={({ pressed }) => [
              s.stop,
              { top: index * 130 + 8 },
              index % 2 === 1 && s.reverse,
              pressed && { transform: [{ translateY: 2 }] },
            ]}
          >
            <View style={s.island}>
              <Image
                source={regionArt[index % regionArt.length]}
                resizeMode="contain"
                style={s.regionArt}
              />
              <View style={[s.nodeRing, active && s.selectedRing]}>
                <View
                  style={[
                    s.node,
                    state === "Completed" && s.completed,
                    state === "Current" && s.current,
                  ]}
                >
                  {state === "Completed" ? (
                    <Icon name="check" size={27} color={colors.parchment} />
                  ) : (
                    <Text style={s.number}>{chapter.chapter}</Text>
                  )}
                  <View style={s.nodeHighlight} />
                </View>
              </View>
              {state === "Current" && (
                <View style={s.flag}>
                  <Icon
                    name="flag-variant"
                    size={15}
                    color={colors.parchment}
                  />
                </View>
              )}
            </View>
            <View style={[s.label, active && s.selectedLabel]}>
              <Text style={s.chapter}>Chapter {chapter.chapter}</Text>
              <Text numberOfLines={2} style={s.title}>
                {chapter.title}
              </Text>
              <Text
                style={[
                  s.state,
                  state === "Completed" && { color: colors.teal },
                ]}
              >
                {state} · {chapter.questions} questions
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
const s = StyleSheet.create({
  map: {
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#e5ead2",
    borderWidth: 1,
    borderColor: "#c2c9aa",
  },
  landLeft: {
    position: "absolute",
    left: -90,
    top: 38,
    width: 200,
    height: 235,
    borderRadius: 100,
    backgroundColor: "#d4dfbd",
    transform: [{ rotate: "-20deg" }],
  },
  landRight: {
    position: "absolute",
    right: -95,
    top: 220,
    width: 260,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#d4dfbd",
  },
  pathDot: {
    position: "absolute",
    width: 7,
    height: 7,
    backgroundColor: "#b8a37a",
    borderRadius: 4,
  },
  stop: {
    position: "absolute",
    left: 8,
    right: 8,
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reverse: { flexDirection: "row-reverse" },
  island: {
    width: 86,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  regionArt: { position: "absolute", width: 114, height: 80, top: -2 },
  nodeRing: {
    padding: 4,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 40,
    marginTop: 20,
  },
  selectedRing: { borderColor: colors.wood },
  node: {
    width: 56,
    height: 52,
    borderRadius: 28,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.edge,
    backgroundColor: colors.parchment,
    alignItems: "center",
    justifyContent: "center",
  },
  nodeHighlight: {
    position: "absolute",
    top: 4,
    left: 11,
    right: 11,
    height: 3,
    backgroundColor: "#ffffff77",
    borderRadius: 3,
  },
  completed: { backgroundColor: colors.teal },
  current: { backgroundColor: colors.gold },
  number: { fontFamily: fonts.heavy, fontSize: 24, color: colors.ink },
  flag: {
    position: "absolute",
    top: 13,
    right: 2,
    backgroundColor: colors.teal,
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.edge,
  },
  label: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 9,
    paddingVertical: 9,
    backgroundColor: "#edf0dc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 3,
  },
  selectedLabel: { borderColor: "#bba679", backgroundColor: colors.parchment },
  chapter: {
    fontFamily: fonts.label,
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  state: {
    fontFamily: fonts.label,
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
  },
});
