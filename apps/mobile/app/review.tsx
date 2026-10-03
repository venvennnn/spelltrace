import { Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { DEMO_CHANGED_SESSION_ID, reviewForSession, watchLabels } from "@spelltrace/shared";

export default function Review() {
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
  const [which, setWhich] = useState<"usual" | "changed">("changed");
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F6F1E8" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 32, fontFamily: "Georgia" }}>Review</Text>
      <Text style={{ color: "#5C564E", marginTop: 8 }}>
        {review.findings.length} deliveries changed relative to your usual {review.baseline.match}. {watchLabels.notRecorded}.
      </Text>
      <View style={{ flexDirection: "row", marginTop: 12, gap: 8 }}>
        {(["changed", "usual"] as const).map((k) => (
          <Pressable
            key={k}
            onPress={() => setWhich(k)}
            accessibilityRole="button"
            style={{
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: 999,
              backgroundColor: which === k ? "#1F6B66" : "#D7E8E5",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: which === k ? "#fff" : "#1F6B66" }}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 200, marginTop: 12, borderRadius: 16, backgroundColor: "#1c1916", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#E4DCD0" }}>{which === "changed" ? "Changed clip + skeleton overlay" : "Usual medoid clip"}</Text>
      </View>
      {review.findings.map((f) => (
        <View key={f.evidenceId} style={{ backgroundColor: "#FFFCF7", borderRadius: 16, padding: 12, marginTop: 10 }}>
          <Text>
            Today {f.current} · median {f.personalMedian} · n={f.sampleCount}
          </Text>
          <Text style={{ marginTop: 4 }}>{f.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
