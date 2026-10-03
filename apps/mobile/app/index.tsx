import { ScrollView, Text, View } from "react-native";
import { DEMO_CHANGED_SESSION_ID, demoTimeline, limits, reviewForSession, watchLabels } from "@spelltrace/shared";

export default function Today() {
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F6F1E8" }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={{ color: "#6B4C9A", fontWeight: "700", marginBottom: 8 }}>{limits.demoBanner}</Text>
      <Text style={{ fontSize: 32, fontFamily: "Georgia" }}>Today</Text>
      <Text style={{ color: "#5C564E", marginTop: 8 }}>{limits.noDiagnosis}</Text>
      <Text style={{ fontSize: 22, fontFamily: "Georgia", marginTop: 20 }}>My day</Text>
      {demoTimeline.blocks.map((b) => (
        <View key={b.id} style={{ backgroundColor: "#FFFCF7", borderRadius: 16, padding: 12, marginTop: 8 }}>
          <Text style={{ color: "#8A8378", fontSize: 12 }}>
            {b.label} · {b.source}
          </Text>
          <Text>{b.missing ? "Missing — not shown as zero" : b.value}</Text>
        </View>
      ))}
      <Text style={{ fontSize: 22, fontFamily: "Georgia", marginTop: 20 }}>What changed</Text>
      <Text style={{ color: "#5C564E", marginTop: 6 }}>
        {review.findings.length} pose findings · {watchLabels.notRecorded}
      </Text>
      {review.findings.map((f) => (
        <View key={f.evidenceId} style={{ backgroundColor: "#FFFCF7", borderRadius: 16, padding: 12, marginTop: 8 }}>
          <Text style={{ fontWeight: "700" }}>{f.feature}</Text>
          <Text>{f.text}</Text>
          <Text style={{ marginTop: 4 }}>
            {f.current} vs median {f.personalMedian} · {f.source}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
