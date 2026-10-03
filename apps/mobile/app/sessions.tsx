import { ScrollView, Text, View } from "react-native";
import { demoSessions } from "@spelltrace/shared";

export default function Sessions() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F6F1E8" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 32, fontFamily: "Georgia" }}>Sessions</Text>
      {demoSessions.map((s) => (
        <View key={s.id} style={{ backgroundColor: "#FFFCF7", borderRadius: 16, padding: 12, marginTop: 10 }}>
          <Text style={{ fontFamily: "Georgia", fontSize: 20 }}>
            {s.view} · {s.drill} · {s.effort}
          </Text>
          <Text style={{ color: "#5C564E" }}>
            {s.deliveries.length} deliveries · {s.video?.deleted ? "original video deleted" : "video kept"}
          </Text>
          <Text style={{ color: "#6B4C9A", fontSize: 12 }}>synthetic-demo</Text>
        </View>
      ))}
    </ScrollView>
  );
}
