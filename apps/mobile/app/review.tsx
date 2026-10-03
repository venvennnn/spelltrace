import { Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { DEMO_CHANGED_SESSION_ID, heroDelta, metricStrip, reviewForSession, todayDrivers, demoSessions } from "@spelltrace/shared";

const BRICK = "#A63A2E";
const INK = "#1A1A1A";
const MUTED = "#66665F";
const LINE = "#D9D6CC";

export default function Review() {
  const session = demoSessions.find((s) => s.id === DEMO_CHANGED_SESSION_ID)!;
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
  const hero = heroDelta(review.findings);
  const [which, setWhich] = useState<"usual" | "changed">("changed");
  const drivers = todayDrivers(session, demoSessions, review.findings, "/review");
  const strip = metricStrip(session, demoSessions);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
      <Text style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>{review.baseline.match}</Text>
      <Text style={{ fontSize: 34, fontFamily: "Georgia", fontWeight: "600" }}>Review</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
        <View style={{ width: 48, height: 3, backgroundColor: BRICK }} />
        <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16 }}>
        <Text style={{ fontSize: 48, fontFamily: "Georgia", fontWeight: "600", color: BRICK }}>{hero.value}</Text>
        <Text style={{ flex: 1, fontSize: 15 }}>{hero.label} vs your usual.</Text>
      </View>
      <View style={{ flexDirection: "row", borderWidth: 1, borderColor: INK, marginTop: 14 }}>
        {(["changed", "usual"] as const).map((k) => (
          <Pressable
            key={k}
            onPress={() => setWhich(k)}
            style={{ flex: 1, minHeight: 44, justifyContent: "center", alignItems: "center", backgroundColor: which === k ? INK : "#fff" }}
          >
            <Text style={{ color: which === k ? "#fff" : INK, fontWeight: which === k ? "600" : "400" }}>{k === "changed" ? "Today" : "Usual"}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 280, marginTop: 10, backgroundColor: "#5a9a3a", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff" }}>{which === "changed" ? "Today clip + overlay" : "Usual clip + overlay"}</Text>
      </View>
      {drivers.map((d) => (
        <View key={d.n} style={{ flexDirection: "row", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderColor: LINE }}>
          <Text style={{ width: 24, textAlign: "center", color: BRICK, fontWeight: "600" }}>{d.n}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600" }}>{d.title}</Text>
            <Text style={{ color: MUTED, fontSize: 13 }}>{d.body}</Text>
          </View>
        </View>
      ))}
      <View style={{ flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: INK }}>
        {strip.map((c, i) => (
          <View key={c.label} style={{ flex: 1, paddingVertical: 10, paddingLeft: i ? 8 : 0, borderLeftWidth: i ? 1 : 0, borderColor: LINE }}>
            <Text style={{ fontSize: 11, color: MUTED }}>{c.label}</Text>
            <Text style={{ fontSize: 14, fontWeight: "500" }}>{c.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
