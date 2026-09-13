import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { icons } from "../assets";
import {
  Badge,
  Button,
  Icon,
  ImageBadge,
  Meter,
  Panel,
  SectionTitle,
  Tabs,
} from "../components/GameUI";
import { colors, ui } from "../theme";
import type { ScreenProps } from "../types";

export function HomeScreen({ navigate, notify }: ScreenProps) {
  const [strategy, setStrategy] = useState("Tactical (3 Stages)");
  const [file, setFile] = useState<string>();
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
  return (
    <View style={{ gap: 20 }}>
      <Panel>
        <View style={ui.between}>
          <View style={ui.row}>
            <Icon name="book-open-page-variant" size={20} />
            <Text style={ui.label}>THE STUDY FORGE</Text>
          </View>
          <Badge text="Tome LVL 1" />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Browse study files"
          onPress={pickFile}
          style={{
            minHeight: 172,
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: "#c5a77c",
            borderRadius: 8,
            padding: 16,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Icon
            name={file ? "file-check-outline" : "file-plus-outline"}
            size={36}
          />
          <Text style={[ui.title, { textAlign: "center" }]}>
            {file ?? "Drop study scroll here"}
          </Text>
          <Text style={ui.body}>
            {file ? "Tap to choose another file" : "or tap to Browse Files"}
          </Text>
          <View style={ui.row}>
            <Badge text="PDF / DOCX" icon="file-document-outline" />
            <Badge text="MAX 25MB" icon="scale-balance" />
          </View>
        </Pressable>
        <Text style={ui.label}>ENCOUNTER STRATEGY</Text>
        <Tabs
          values={["Tactical (3 Stages)", "Boss Rush"]}
          selected={strategy}
          onChange={setStrategy}
        />
        <Button
          label="Forge Adventure"
          icon="lightning-bolt"
          tone="gold"
          onPress={() => {
            if (!file) {
              notify("Pilih study scroll terlebih dahulu.");
              return;
            }
            notify("Preview adventure dibuka. Dokumen belum diproses.");
            navigate("Map");
          }}
        />
      </Panel>
      <SectionTitle
        title="Active Expeditions"
        aside="2 In Progress"
        color={colors.white}
      />
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
        <Panel key={quest.title}>
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
              <Text style={ui.title}>{quest.title}</Text>
              <Text style={ui.label}>{quest.stage}</Text>
            </View>
            <ImageBadge text={quest.xp} source={icons.exp} size={22} />
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
            onPress={() => navigate("Map")}
          />
        </Panel>
      ))}
      <Panel>
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
          onPress={() => {}}
        />
      </Panel>
    </View>
  );
}
