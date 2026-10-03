import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import {
  DEMO_CHANGED_SESSION_ID,
  contextPatterns,
  demoSessions,
  heroDelta,
  metricStrip,
  reviewForSession,
  todayDrivers,
} from "@spelltrace/shared";

const BRICK = "#A63A2E";
const INK = "#1A1A1A";
const MUTED = "#66665F";
const LINE = "#D9D6CC";

function Rule() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 }}>
      <View style={{ width: 48, height: 3, backgroundColor: BRICK }} />
      <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
    </View>
  );
}

export default function Today() {
  const session = demoSessions.find((s) => s.id === DEMO_CHANGED_SESSION_ID)!;
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
  const hero = heroDelta(review.findings);
  const drivers = todayDrivers(session, demoSessions, review.findings, "/review");
  const strip = metricStrip(session, demoSessions);
  const patterns = contextPatterns(session, demoSessions);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View>
          <Text style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>Fri 2 Oct · side-on nets</Text>
          <Text style={{ fontSize: 34, fontFamily: "Georgia", fontWeight: "600", color: INK }}>Today</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 26, fontFamily: "Georgia", fontWeight: "600", color: BRICK }}>{review.findings.length}</Text>
          <Text style={{ fontSize: 12, color: MUTED }}>changes vs usual</Text>
        </View>
      </View>
      <Rule />
      <Text style={{ marginTop: 18, fontSize: 11, fontWeight: "600", letterSpacing: 1.2, color: BRICK }}>WHAT CHANGED</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 }}>
        <Text style={{ fontSize: 52, fontFamily: "Georgia", fontWeight: "600", color: BRICK }}>{hero.value}</Text>
        <Text style={{ flex: 1, fontSize: 15, lineHeight: 21 }}>{hero.label} vs your usual {review.baseline.match}.</Text>
      </View>
      <Pressable onPress={() => router.push("/review")} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ color: BRICK, fontWeight: "500" }}>Compare usual vs today →</Text>
      </Pressable>

      <Text style={{ marginTop: 16, fontSize: 11, fontWeight: "600", letterSpacing: 1.2, color: BRICK }}>WHAT’S DRIVING TODAY</Text>
      {drivers.map((d) => (
        <View key={d.n} style={{ flexDirection: "row", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderColor: LINE }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: d.strong ? BRICK : INK,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: d.strong ? BRICK : INK }}>{d.n}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", fontSize: 14 }}>{d.title}</Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{d.body}</Text>
          </View>
        </View>
      ))}

      <View style={{ flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: INK, marginTop: 8 }}>
        {strip.map((c, i) => (
          <View key={c.label} style={{ flex: 1, paddingVertical: 10, paddingLeft: i ? 8 : 0, borderLeftWidth: i ? 1 : 0, borderColor: LINE }}>
            <Text style={{ fontSize: 11, color: MUTED }}>{c.label}</Text>
            <Text style={{ fontSize: 14, fontWeight: "500" }}>{c.value}</Text>
            <Text style={{ fontSize: 11, color: c.alert ? BRICK : MUTED }}>{c.note}</Text>
          </View>
        ))}
      </View>

      <Text style={{ marginTop: 22, fontSize: 11, fontWeight: "600", letterSpacing: 1.2, color: BRICK }}>CONTEXT VS LEAN</Text>
      {patterns.map((p) => (
        <View key={p.id} style={{ paddingVertical: 10, borderTopWidth: 1, borderColor: LINE }}>
          <Text style={{ fontSize: 13, fontWeight: "500" }}>{p.name}</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", letterSpacing: 0.6, color: p.tagColor }}>{p.tag}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
