import { ScrollView, Text, View } from "react-native";
import {
  DEMO_CHANGED_SESSION_ID,
  cycleDelta,
  environmentDeltas,
  movementDeltas,
  recoveryDeltas,
  reviewForSession,
  demoSessions,
} from "@spelltrace/shared";

function Rows({ title, rows }: { title: string; rows: { id: string; label: string; today: string; usual: string; delta: string }[] }) {
  return (
    <View style={{ marginTop: 16, borderWidth: 1, borderColor: "#E8E8E8", borderRadius: 16, padding: 12, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 18, fontFamily: "Georgia" }}>{title}</Text>
      {rows.map((r) => (
        <View key={r.id} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ flex: 1 }}>{r.label}</Text>
          <Text>{r.today}</Text>
          <Text style={{ color: "#8A8378", marginLeft: 8 }}>vs {r.usual}</Text>
          <Text style={{ fontWeight: "700", marginLeft: 8 }}>{r.delta}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Today() {
  const session = demoSessions.find((s) => s.id === DEMO_CHANGED_SESSION_ID)!;
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#6B4C9A", fontWeight: "700" }}>Demo</Text>
      <Text style={{ fontSize: 28, fontFamily: "Georgia" }}>Today</Text>
      <Rows title="Movement" rows={movementDeltas(review.findings)} />
      <Rows title="Sleep & recovery" rows={recoveryDeltas(session, demoSessions)} />
      <Rows title="Cycle" rows={[cycleDelta(session, demoSessions)]} />
      <Rows title="Environment" rows={environmentDeltas(session, demoSessions)} />
    </ScrollView>
  );
}
