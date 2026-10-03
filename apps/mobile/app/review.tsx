import { Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { DEMO_CHANGED_SESSION_ID, movementDeltas, reviewForSession } from "@spelltrace/shared";

export default function Review() {
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
  const [which, setWhich] = useState<"usual" | "changed">("changed");
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontFamily: "Georgia" }}>Review</Text>
      <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
        {(["changed", "usual"] as const).map((k) => (
          <Pressable
            key={k}
            onPress={() => setWhich(k)}
            style={{
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: 999,
              backgroundColor: which === k ? "#1F6B66" : "#E6F3F1",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: which === k ? "#fff" : "#1F6B66" }}>{k === "changed" ? "Today" : "Usual"}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 280, marginTop: 12, borderRadius: 16, backgroundColor: "#5a9a3a", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff" }}>{which === "changed" ? "Today clip + overlay" : "Usual clip + overlay"}</Text>
      </View>
      {movementDeltas(review.findings).map((r) => (
        <View key={r.id} style={{ marginTop: 10, borderWidth: 1, borderColor: "#E8E8E8", borderRadius: 12, padding: 10 }}>
          <Text style={{ fontWeight: "700" }}>{r.label}</Text>
          <Text>
            {r.today} vs {r.usual} · {r.delta}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
