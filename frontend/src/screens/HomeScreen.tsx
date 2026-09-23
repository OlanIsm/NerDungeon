import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { art, gui, icons } from "../assets";
import { Badge, Button, Icon, ImageBadge, Meter } from "../components/GameUI";
import { NineSliceFrame } from "../components/NineSliceFrame";
import { colors, fonts, ui } from "../theme";
import type { ScreenProps } from "../types";

export function HomeScreen({ navigate, notify }: ScreenProps) {
  const [file, setFile] = useState<string>();
  const [forging, setForging] = useState(false);
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
    } catch {
      notify("File belum bisa dibuka. Coba pilih lagi.");
    }
  }

  async function forgeAdventure() {
    if (forging) return;
    setForging(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setForging(false);
    navigate("Expedition");
  }

  return (
    <View>
      <Modal
        animationType="fade"
        onRequestClose={() => {}}
        statusBarTranslucent
        transparent
        visible={forging}
      >
        <View accessibilityViewIsModal style={styles.forgeOverlay}>
          <Image
            accessible
            accessibilityLabel="Nerd eating PDF"
            source={art.nerdEatPdf}
            resizeMode="contain"
            style={styles.loadingGif}
          />
          <Text accessibilityLiveRegion="polite" style={styles.loadingTitle}>
            FORGING YOUR ADVENTURE...
          </Text>
          <Text numberOfLines={1} style={styles.loadingFile}>
            Extracting {file}
          </Text>
        </View>
      </Modal>
      <View style={styles.forgeCard}>
        <ScrollFrame />
        <View style={styles.forgeHeading}>
          <Text style={styles.forgeTitle}>THE STUDY FORGE</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Browse study files"
          onPress={pickFile}
          style={({ pressed }) => [
            styles.dropZone,
            pressed && { transform: [{ scale: 0.99 }], opacity: 0.94 },
          ]}
        >
          {file ? (
            <Image
              accessible
              accessibilityLabel="Selected PDF"
              source={icons.pdf}
              resizeMode="contain"
              style={styles.pdfIcon}
            />
          ) : (
            <Icon name="file-plus-outline" size={46} color="#5d2d0b" />
          )}
          <Text numberOfLines={2} style={styles.uploadTitle}>
            {file ?? "Drop study scroll here"}
          </Text>
          <Text style={styles.uploadSubtitle}>
            {file ? "Tap to choose another file" : "or tap to Browse Files"}
          </Text>
          <View style={ui.row}>
            <Badge text="PDF / DOCX" icon="file-document-outline" />
            <Badge text="MAX 25MB" icon="scale-balance" />
          </View>
        </Pressable>
        {file && (
          <Button
            label="Forge Adventure"
            tone="gold"
            style={styles.forgeButton}
            onPress={forgeAdventure}
          />
        )}
      </View>
      <View style={styles.expeditionHeader}>
        <View style={styles.expeditionTitle}>
          <Image
            accessibilityIgnoresInvertColors
            source={gui.sectionTitle}
            resizeMode="contain"
            style={styles.expeditionBackground}
          />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.expeditionText}
          >
            Active Expeditions
          </Text>
        </View>
      </View>
      {[
        {
          title: "Biologi — Fotosintesis",
          stage: "Stage 2/3 • 18/30 Questions",
          xp: "+350 EXP",
          encounter: "Calvin Cycle Golem",
          progress: 60,
          icon: "head-lightbulb-outline" as const,
        },
        {
          title: "Fisika Dasar — Gravitasi",
          stage: "Stage 1/3 • 8/30 Questions",
          xp: "+200 EXP",
          encounter: "Newton’s Apple Slime",
          progress: 27,
          icon: "earth" as const,
        },
      ].map((quest) => (
        <View key={quest.title} style={styles.questCard}>
          <NineSliceFrame
            images={gui.expeditionCard9}
            top={25}
            bottom={31}
            side={62}
          />
          <View style={ui.row}>
            <View
              style={{
                backgroundColor: colors.teal,
                padding: 9,
                borderRadius: 10,
              }}
            >
              <Icon name={quest.icon} color={colors.white} />
            </View>
            <View style={ui.flex}>
              <Text style={[ui.title, styles.questTitle]}>{quest.title}</Text>
              <Text style={ui.label}>{quest.stage}</Text>
            </View>
            <ImageBadge text={quest.xp} source={icons.exp} size={18} />
          </View>
          <View style={ui.between}>
            <Text style={[ui.label, ui.flex]}>
              Encounter: {quest.encounter}
            </Text>
            <Text style={ui.label}>{quest.progress}% Cleared</Text>
          </View>
          <Meter value={quest.progress} />
          <Button
            label="Continue Quest"
            icon="play"
            tone="gold"
            style={styles.questButton}
            onPress={() => navigate("Expedition")}
          />
        </View>
      ))}
      <View style={styles.questCard}>
        <NineSliceFrame
          images={gui.expeditionCard9}
          top={25}
          bottom={31}
          side={62}
        />
        <View style={ui.row}>
          <Icon name="check-decagram" size={30} />
          <View style={ui.flex}>
            <Text style={ui.title}>Daily Guild Harvest</Text>
            <Text style={ui.label}>Resets in 06h 42m</Text>
          </View>
          <Badge text="+450 Gold" />
        </View>
        <Meter value={100} label="Complete 1 Biology Stage · 1 / 1 Completed" />
        <Button
          label="Claimed"
          icon="check"
          tone="quiet"
          disabled
          style={styles.questButton}
          onPress={() => {}}
        />
        <View
          accessibilityLabel="Claimed expedition"
          pointerEvents="none"
          style={styles.claimedOverlay}
        >
          <Image
            accessibilityIgnoresInvertColors
            source={gui.claimed}
            resizeMode="contain"
            style={styles.claimedBadge}
          />
        </View>
      </View>
    </View>
  );
}

function ScrollFrame() {
  return <NineSliceFrame images={gui.scroll9} top={46} bottom={52} side={46} />;
}

const styles = StyleSheet.create({
  forgeOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(15, 27, 55, 0.92)",
  },
  loadingGif: { width: 240, height: 240 },
  loadingTitle: {
    marginTop: 16,
    fontFamily: fonts.heavy,
    fontSize: 18,
    color: "#ffd35a",
    textAlign: "center",
  },
  loadingFile: {
    maxWidth: 300,
    marginTop: 7,
    fontFamily: fonts.heading,
    fontSize: 14,
    color: "#fff2cf",
  },
  forgeCard: {
    minHeight: 310,
    marginHorizontal: -6,
    paddingHorizontal: 14,
    paddingTop: 30,
    paddingBottom: 40,
    gap: 12,
  },
  forgeHeading: { alignItems: "center", transform: [{ translateY: 5 }] },
  forgeTitle: {
    fontFamily: fonts.heavy,
    fontSize: 19,
    color: "#4a2108",
    letterSpacing: 0.8,
    textShadowColor: "#fff2c7",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  dropZone: {
    minHeight: 160,
    marginHorizontal: 10,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff2cf",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#d59a42",
    borderRadius: 14,
  },
  uploadTitle: {
    fontFamily: fonts.heavy,
    fontSize: 19,
    lineHeight: 24,
    color: "#3b1b06",
    textAlign: "center",
  },
  uploadSubtitle: {
    fontFamily: fonts.heading,
    fontSize: 14,
    lineHeight: 20,
    color: "#69401f",
    textAlign: "center",
  },
  pdfIcon: { width: 68, height: 68 },
  forgeButton: {
    width: "52%",
    minHeight: 46,
    alignSelf: "center",
  },
  expeditionHeader: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
  },
  expeditionTitle: {
    width: "82%",
    maxWidth: 300,
    aspectRatio: 2175 / 723,
    justifyContent: "center",
  },
  expeditionBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  expeditionText: {
    marginLeft: "27%",
    marginRight: 8,
    paddingBottom: 2,
    fontFamily: fonts.heavy,
    fontSize: 16,
    color: colors.white,
    textShadowColor: "#06235e",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1,
  },
  questCard: {
    position: "relative",
    marginBottom: 12,
    paddingTop: 26,
    paddingHorizontal: 30,
    paddingBottom: 38,
    gap: 10,
  },
  questTitle: { fontSize: 15, lineHeight: 20 },
  questButton: {
    width: "82%",
    minHeight: 48,
    alignSelf: "center",
  },
  claimedOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
    zIndex: 3,
    overflow: "hidden",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(67, 210, 42, 0.52)",
  },
  claimedBadge: { width: 140, height: 140 },
});
