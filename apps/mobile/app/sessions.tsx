import { ScrollView, Text, View } from "react-native";
import { demoSessions } from "@spelltrace/shared";

export default function Sessions() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontFamily: "Georgia" }}>Sessions</Text>
      {demoSessions.map((s) => (
        <View key={s.id} style={{ borderWidth: 1, borderColor: "#E8E8E8", borderRadius: 16, padding: 12, marginTop: 8 }}>
          <Text style={{ fontWeight: "700" }}>
            {new Date(s.startedAtUtc).toLocaleDateString()} · {s.view} {s.drill}
          </Text>
          <Text style={{ color: "#5C564E" }}>
            {s.deliveries.length} balls{s.video?.deleted ? " · video deleted" : ""}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
