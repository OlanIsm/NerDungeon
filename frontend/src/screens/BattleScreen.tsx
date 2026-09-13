import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { art } from "../assets";
import { Badge, Button, Icon, Meter, Panel } from "../components/GameUI";
import { colors, fonts, ui } from "../theme";
import type { ScreenProps } from "../types";

const answers = [
  "Menyerap foton cahaya merah & biru untuk eksitasi elektron.",
  "Menguraikan glukosa menjadi molekul ATP secara anaerob.",
  "Menyimpan cadangan air & ion mineral pada organel vakuola sel.",
];
export function BattleScreen({ navigate, notify }: ScreenProps) {
  const [answer, setAnswer] = useState<number>();
  const correct = answer === 0;
  return (
    <View style={{ gap: 16 }}>
      <View style={ui.between}>
        <Button
          label="Exit"
          icon="logout"
          onPress={() => navigate("Map")}
          style={{ minWidth: 104 }}
        />
        <Badge text="STAGE 1/3" icon="flag-outline" />
      </View>
      <View
        style={{ backgroundColor: "#efe4c7", paddingVertical: 12, gap: 14 }}
      >
        <View style={ui.row}>
          {[
            {
              name: "Nerd Mage Lv.3",
              hp: answer !== undefined && !correct ? "400/580" : "580/580",
              value: answer !== undefined && !correct ? 69 : 100,
              color: "#65c932",
            },
            {
              name: "Goblin Imp Lv.1",
              hp: correct ? "70/600" : "420/600",
              value: correct ? 12 : 70,
              color: "#f05238",
            },
          ].map((actor) => (
            <View
              key={actor.name}
              style={{
                flex: 1,
                backgroundColor: "#562b0d",
                borderWidth: 2,
                borderColor: "#271103",
                borderBottomWidth: 4,
                borderRadius: 10,
                padding: 8,
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 10,
                  color: "#ffeec7",
                }}
              >
                {actor.name} {actor.hp}
              </Text>
              <Meter value={actor.value} color={actor.color} />
            </View>
          ))}
        </View>
        <View style={{ height: 160, justifyContent: "flex-end" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 30,
              paddingBottom: 8,
            }}
          >
            <Image
              source={art.mage}
              style={{ width: 96, height: 96 }}
              resizeMode="contain"
            />
            <Image
              source={art.goblin}
              style={{ width: 96, height: 96 }}
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              height: 40,
              backgroundColor: "#623610",
              borderTopWidth: 11,
              borderTopColor: "#5f9e24",
              borderWidth: 2,
              borderColor: "#391c07",
              borderRadius: 5,
            }}
          />
        </View>
      </View>
      <Panel
        style={{
          backgroundColor: "#783f16",
          borderWidth: 3,
          borderColor: "#381b06",
          borderBottomWidth: 6,
          gap: 12,
          padding: 10,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff4dc",
            borderRadius: 10,
            padding: 12,
            gap: 12,
            borderWidth: 2,
            borderColor: "#cbb38e",
          }}
        >
          <View style={ui.between}>
            <Badge text="BAB 4: FOTOSINTESIS" icon="book-open-variant" />
            <Text style={ui.label}>00:24s</Text>
          </View>
          <Text style={[ui.title, { fontSize: 14 }]}>
            Apa fungsi utama dari klorofil a dalam proses reaksi terang
            fotosintesis?
          </Text>
        </View>
        {answers.map((text, index) => (
          <Pressable
            key={text}
            accessibilityRole="button"
            accessibilityLabel={`${"ABC"[index]}. ${text}`}
            accessibilityState={{
              disabled: answer !== undefined,
              selected: answer === index,
            }}
            disabled={answer !== undefined}
            onPress={() => setAnswer(index)}
            style={({ pressed }) => ({
              backgroundColor:
                answer === index
                  ? correct
                    ? "#d6edbd"
                    : "#f8d2bc"
                  : "#f8ebd1",
              borderWidth: 2,
              borderBottomWidth: 4,
              borderColor: "#5e300e",
              borderRadius: 12,
              minHeight: 74,
              padding: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              transform: [{ translateY: pressed ? 2 : 0 }],
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: ["#ec9200", "#149bc5", "#20ac45"][index],
                borderWidth: 2,
                borderColor: "#52300d",
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={[ui.title, { color: colors.white }]}>
                {"ABC"[index]}
              </Text>
            </View>
            <Text style={[ui.title, { flex: 1, fontSize: 12, lineHeight: 17 }]}>
              {text}
            </Text>
            {answer === index && (
              <Icon name={correct ? "check" : "close"} size={18} />
            )}
          </Pressable>
        ))}
        {answer !== undefined && (
          <View accessibilityLiveRegion="polite" style={ui.inset}>
            <Text style={ui.title}>
              {correct ? "KRITIKAL! +350 DMG" : "SALAH! −180 HP"}
            </Text>
            <Text style={ui.body}>
              {correct
                ? "Klorofil a menyerap energi cahaya untuk mengeksitasi elektron dalam reaksi terang."
                : answer === 1
                  ? "Penguraian glukosa anaerob adalah proses glikolisis. Klorofil a menangkap energi cahaya."
                  : "Vakuola menyimpan air dan ion mineral. Klorofil a menangkap energi cahaya."}
            </Text>
            <Button
              label="Try Again"
              tone="quiet"
              onPress={() => setAnswer(undefined)}
            />
          </View>
        )}
        <Button
          label="Petunjuk"
          icon="help-circle-outline"
          style={{ alignSelf: "flex-start", minWidth: 135 }}
          onPress={() =>
            notify(
              "Petunjuk: klorofil adalah pigmen penangkap energi cahaya. Ini adalah contoh soal dari desain Stitch.",
            )
          }
        />
      </Panel>
    </View>
  );
}
