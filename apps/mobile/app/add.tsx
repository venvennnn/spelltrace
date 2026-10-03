import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useState } from "react";

const BRICK = "#A63A2E";
const INK = "#1A1A1A";
const MUTED = "#66665F";
const LINE = "#D9D6CC";
const CHIPS = ["Heavy legs", "Soreness", "Poor sleep", "Hot", "On my period"];

export default function Add() {
  const [rpe, setRpe] = useState(8);
  const [on, setOn] = useState<Record<string, boolean>>({ "Poor sleep": true, Hot: true });
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
      <Text style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>Side-on nets · after the spell</Text>
      <Text style={{ fontSize: 34, fontFamily: "Georgia", fontWeight: "600" }}>Session log</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
        <View style={{ width: 48, height: 3, backgroundColor: BRICK }} />
        <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
      </View>
      <Text style={{ marginTop: 18, fontSize: 11, fontWeight: "600", letterSpacing: 1.2, color: BRICK }}>HOW HARD DID IT FEEL?</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <Pressable
            key={n}
            onPress={() => setRpe(n)}
            accessibilityLabel={`RPE ${n}`}
            style={{
              width: 56,
              height: 44,
              borderWidth: 1,
              borderColor: rpe === n ? BRICK : LINE,
              backgroundColor: rpe === n ? BRICK : "#fff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: rpe === n ? "#fff" : INK, fontWeight: rpe === n ? "600" : "400" }}>{n}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ marginTop: 18, fontSize: 11, fontWeight: "600", letterSpacing: 1.2, color: BRICK }}>ANYTHING ELSE?</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {CHIPS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setOn((p) => ({ ...p, [c]: !p[c] }))}
            style={{
              minHeight: 44,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: on[c] ? INK : LINE,
              backgroundColor: on[c] ? INK : "#fff",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: on[c] ? "#fff" : INK }}>{c}</Text>
          </Pressable>
        ))}
      </View>
      {["Timezone", "Bowling arm", "View", "Drill", "Effort"].map((label) => (
        <View key={label} style={{ marginTop: 12 }}>
          <Text style={{ color: MUTED, fontSize: 12 }}>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            style={{ minHeight: 44, borderWidth: 1, borderColor: LINE, padding: 10, marginTop: 4 }}
          />
        </View>
      ))}
    </ScrollView>
  );
}
