import { ImageBackground, Text, View, useWindowDimensions } from "react-native";
import { art } from "../assets";
import { Badge, Button, Icon, Panel } from "../components/GameUI";
import { colors, ui } from "../theme";
import type { ScreenProps } from "../types";

export function AdventureScreen({ navigate, notify }: ScreenProps) {
  const { width } = useWindowDimensions();
  const mapWidth = Math.min(width, 520) - 44;
  return (
    <View style={{ gap: 16 }}>
      <Panel>
        <View style={ui.row}>
          <Icon name="book-open-variant" />
          <View style={ui.flex}>
            <Text style={ui.label}>Material Mission</Text>
            <Text style={ui.heading}>Bab 4: Fotosintesis & Metabolisme</Text>
          </View>
          <Badge text="ACT I" icon="lightning-bolt" color={colors.teal} />
        </View>
        <View style={ui.between}>
          <Badge text="30 Total Qs" icon="help-box-outline" />
          <Badge text="Streak 12 Win" icon="fire" />
          <Text style={ui.label}>Progress: 1/3</Text>
        </View>
      </Panel>
      <Panel
        style={{
          padding: 8,
          backgroundColor: colors.wood,
          borderWidth: 2,
          borderColor: colors.edge,
        }}
      >
        <ImageBackground
          source={art.forest}
          resizeMode="cover"
          imageStyle={{ borderRadius: 8, width: mapWidth, height: 470 }}
          style={{
            width: mapWidth,
            height: 470,
            padding: 12,
            justifyContent: "space-between",
          }}
        >
          <View style={[ui.inset, { opacity: 0.93 }]}>
            <View style={ui.row}>
              <Icon name="lock-outline" size={28} />
              <View style={ui.flex}>
                <Text style={ui.title}>Chlorophyll Shrine</Text>
                <Text style={ui.label}>Q21-30 • Titan Treant</Text>
                <Text style={[ui.label, { color: colors.red }]}>
                  Clear Stage 2 to Unlock
                </Text>
              </View>
              <Badge text="LOCKED" />
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <View style={ui.center}>
              <Badge text="YOU ARE HERE!" icon="navigation-variant" />
            </View>
            <Panel
              style={{
                backgroundColor: "#fff5dc",
                borderWidth: 3,
                borderColor: colors.gold,
              }}
            >
              <View style={ui.row}>
                <Icon name="sword-cross" size={32} />
                <View style={ui.flex}>
                  <Text style={ui.heading}>Sunlit Grove Ruins</Text>
                  <Text style={ui.body}>Questions 11-20 • 2× Forest Imps</Text>
                </View>
                <Badge text="Stage 2" color={colors.teal} />
              </View>
              <Text style={ui.label}>LOOT DROP: +300 XP · 150 Gold · Rune</Text>
            </Panel>
          </View>
          <Panel>
            <View style={ui.row}>
              <Icon name="check-decagram" color={colors.teal} size={28} />
              <View style={ui.flex}>
                <Text style={ui.title}>Whispering Meadow</Text>
                <Text style={ui.body}>Q1-10 • Goblin Scout (Defeated)</Text>
                <Text style={[ui.label, { color: colors.teal }]}>
                  Score: 10/10 Perfect Mastery
                </Text>
              </View>
            </View>
            <Button
              label="Replay"
              icon="replay"
              tone="quiet"
              onPress={() => navigate("Battle")}
            />
          </Panel>
        </ImageBackground>
      </Panel>
      <Panel>
        <View style={ui.between}>
          <View style={[ui.row, ui.flex]}>
            <Icon name="file-document-outline" size={18} />
            <Text style={[ui.label, ui.flex]}>
              Fotosintesis_Lengkap_Revisi.pdf
            </Text>
          </View>
          <Badge text="Verified" color={colors.teal} />
        </View>
        <View style={ui.row}>
          {[
            ["Easy", "10/10", "Cleared"],
            ["Medium", "10 Qs", "Ready"],
            ["Hard", "10 Qs", "Locked"],
          ].map(([name, count, status]) => (
            <View key={name} style={[ui.inset, ui.flex, ui.center]}>
              <Text style={ui.label}>{name}</Text>
              <Text style={ui.title}>{count}</Text>
              <Text style={ui.label}>{status}</Text>
            </View>
          ))}
        </View>
        <View style={ui.inset}>
          <Text style={ui.body}>
            Dungeon Tip: Review the Calvin Cycle and Photolysis before
            initiating combat. Forest Imps cast confusing debuffs when light
            reactions are misidentified!
          </Text>
        </View>
        <Button
          label="Start Stage 2 (Battle!)"
          icon="sword-cross"
          tone="gold"
          onPress={() => navigate("Battle")}
        />
        <Button
          label="Review Summary Notes"
          icon="book-open-page-variant"
          tone="quiet"
          onPress={() =>
            notify(
              "Preview materi: reaksi terang menangkap energi cahaya; siklus Calvin menggunakan hasilnya untuk fiksasi karbon. Contoh dari desain Stitch.",
            )
          }
        />
      </Panel>
    </View>
  );
}
