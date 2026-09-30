import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { art } from "../assets";
import {
  Button,
  Icon,
  Meter,
  SectionTitle,
  useReducedMotion,
} from "../components/GameUI";
import { RealmFrame } from "../components/FantasyUI";
import { colors, fonts, ui } from "../theme";
import {
  ExpeditionCard,
  expeditions,
  type Expedition,
  type Region,
} from "./AdventureScreen";
import type { ScreenProps } from "../types";

export function HomeScreen({
  navigate,
  notify,
  onSelectExpedition,
  onContinue,
  lastAdventure,
  expeditions: items = expeditions,
  onForge,
}: ScreenProps & {
  onSelectExpedition: (expedition: Expedition) => void;
  onContinue: () => void;
  lastAdventure: { expedition: Expedition; region: Region };
  expeditions?: Expedition[];
  onForge: (asset: DocumentPicker.DocumentPickerAsset) => Promise<void>;
}) {
  const [file, setFile] = useState<string>();
  const [asset, setAsset] = useState<DocumentPicker.DocumentPickerAsset>();
  const [forging, setForging] = useState(false);
  const reducedMotion = useReducedMotion();
  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (
        !/\.(pdf|docx)$/i.test(asset.name) ||
        (asset.size ?? 0) > 25 * 1024 * 1024
      ) {
        notify("Pilih PDF atau DOCX dengan ukuran maksimal 25 MB.");
        return;
      }
      setFile(asset.name);
      setAsset(asset);
    } catch {
      notify("File belum bisa dibuka. Coba pilih lagi.");
    }
  }

  async function forgeAdventure() {
    if (forging) return;
    setForging(true);
    try {
      if (!asset) throw new Error("Choose a file first");
      await onForge(asset);
      navigate("Expedition");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Forge failed");
    } finally {
      setForging(false);
    }
  }

  return (
    <View style={s.page}>
      <Modal
        animationType={reducedMotion ? "none" : "fade"}
        onRequestClose={() => {}}
        statusBarTranslucent
        transparent
        visible={forging}
      >
        <View accessibilityViewIsModal style={s.forgeOverlay}>
          <Image
            accessible
            accessibilityLabel="Nerd eating PDF"
            source={reducedMotion ? art.character : art.nerdEatPdf}
            resizeMode="contain"
            style={s.loadingArt}
          />
          <Text accessibilityLiveRegion="polite" style={s.loadingTitle}>
            Forging your adventure…
          </Text>
          <Text numberOfLines={2} style={s.loadingFile}>
            {file}
          </Text>
        </View>
      </Modal>

      <View style={s.scroll}>
        <View pointerEvents="none" style={[s.scrollRoll, s.rollTop]}>
          <View style={s.rollHighlight} />
        </View>
        <View pointerEvents="none" style={[s.scrollRoll, s.rollBottom]}>
          <View style={s.rollHighlight} />
        </View>
        <View style={s.forgeHeading}>
          <Icon name="feather" size={23} color={colors.wood} />
          <Text style={s.forgeTitle}>The Study Forge</Text>
        </View>
        <Text style={s.forgeSubtitle}>
          Every great quest starts with a little knowledge.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Browse study files"
          onPress={pickFile}
          style={({ pressed }) => [
            s.dropZone,
            pressed && { backgroundColor: "#f7e8c1" },
          ]}
        >
          <View
            accessibilityLabel={file ? "Selected PDF" : undefined}
            style={s.documentEmblem}
          >
            <Icon
              name={file ? "file-check-outline" : "file-plus-outline"}
              size={30}
              color={colors.teal}
            />
          </View>
          <Text numberOfLines={2} style={s.uploadTitle}>
            {file ?? "Turn your notes into an adventure"}
          </Text>
          <Text style={s.uploadSubtitle}>
            {file ? "Tap to choose another file" : "Upload your study material"}
          </Text>
          {!file && (
            <View style={s.browse}>
              <Text style={s.browseText}>Browse files</Text>
              <Icon name="upload" size={18} color={colors.ink} />
            </View>
          )}
          <Text style={s.formats}>PDF / DOCX · Max 25 MB · Starter chapters use file name</Text>
        </Pressable>
        {file && (
          <Button
            label="Forge Adventure"
            tone="gold"
            icon="creation"
            onPress={forgeAdventure}
            disabled={forging}
          />
        )}
      </View>

      <RealmFrame variant="sage" style={s.continueCard}>
        <View style={ui.row}>
          <Icon name="flag-variant" size={21} color={colors.teal} />
          <Text style={s.continueHeading}>Continue Adventure</Text>
        </View>
        <Text style={s.questTitle}>{lastAdventure.expedition.title}</Text>
        <Text style={ui.body}>
          Chapter {lastAdventure.region.chapter} · {lastAdventure.region.title}
        </Text>
        <View style={s.progressRow}>
          <View style={ui.flex}>
            <Meter
              value={lastAdventure.expedition.progress}
              label="Expedition progress"
            />
          </View>
          <Text style={s.progressValue}>
            {lastAdventure.expedition.progress}%
          </Text>
        </View>
        <Button
          label="Continue Adventure"
          tone="gold"
          icon="play"
          onPress={onContinue}
        />
      </RealmFrame>

      <View style={s.materialHeading}>
        <View style={ui.flex}>
          <SectionTitle title="Study scrolls" />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all expeditions"
          onPress={() => navigate("Expedition")}
          style={s.allLink}
        >
          <Text style={s.allText}>View all</Text>
          <Icon name="chevron-right" size={18} color={colors.teal} />
        </Pressable>
      </View>
      <View style={s.materials}>
        {items.slice(0, 2).map((expedition) => (
          <ExpeditionCard
            key={expedition.title}
            expedition={expedition}
            onPress={() => onSelectExpedition(expedition)}
          />
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  page: { gap: 20 },
  scroll: {
    backgroundColor: "#f9edcd",
    borderWidth: 2,
    borderColor: "#9a794b",
    marginHorizontal: 4,
    marginTop: 8,
    padding: 16,
    paddingTop: 23,
    paddingBottom: 22,
    gap: 10,
    borderRadius: 10,
  },
  scrollRoll: {
    position: "absolute",
    left: -8,
    right: -8,
    height: 17,
    backgroundColor: "#dec08a",
    borderWidth: 2,
    borderBottomWidth: 3,
    borderColor: colors.wood,
    borderRadius: 12,
  },
  rollTop: { top: -9 },
  rollBottom: { bottom: -9 },
  rollHighlight: {
    height: 3,
    marginTop: 2,
    marginHorizontal: 10,
    backgroundColor: "#fff2ce",
    borderRadius: 3,
  },
  forgeHeading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  forgeTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.ink },
  forgeSubtitle: {
    ...ui.body,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
  },
  dropZone: {
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#b49b71",
    borderRadius: 14,
    backgroundColor: "#fff8e5",
  },
  documentEmblem: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a8b594",
  },
  uploadTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    lineHeight: 23,
    textAlign: "center",
    color: colors.ink,
    maxWidth: 290,
  },
  uploadSubtitle: { ...ui.body, fontSize: 12, textAlign: "center" },
  browse: {
    minHeight: 44,
    width: "100%",
    maxWidth: 230,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.edge,
    borderRadius: 12,
  },
  browseText: { fontFamily: fonts.heading, fontSize: 14, color: colors.ink },
  formats: { ...ui.label, fontSize: 11, textAlign: "center" },
  continueCard: { gap: 8, marginTop: 6 },
  continueHeading: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.teal,
  },
  questTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  progressValue: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.teal,
  },
  materialHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: -14,
  },
  allLink: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  allText: { fontFamily: fonts.heading, fontSize: 12, color: colors.teal },
  materials: { gap: 10 },
  harvest: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#cdbf9e",
  },
  harvestSeal: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  harvestTitle: { ...ui.title, fontSize: 14, marginBottom: 3 },
  forgeOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(35,45,35,0.96)",
  },
  loadingArt: { width: 220, height: 220 },
  loadingTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    textAlign: "center",
    color: colors.gold,
    marginTop: 16,
  },
  loadingFile: {
    ...ui.body,
    color: colors.parchment,
    textAlign: "center",
    marginTop: 10,
  },
});
