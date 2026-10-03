import { ScrollView, Text, View } from "react-native";
import { demoSessions } from "@spelltrace/shared";

const MUTED = "#66665F";
const LINE = "#D9D6CC";
const BRICK = "#A63A2E";

export default function Sessions() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 34, fontFamily: "Georgia", fontWeight: "600" }}>Sessions</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 8 }}>
        <View style={{ width: 48, height: 3, backgroundColor: BRICK }} />
        <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
      </View>
      {demoSessions.map((s) => (
        <View key={s.id} style={{ borderTopWidth: 1, borderColor: LINE, paddingVertical: 12 }}>
          <Text style={{ fontWeight: "500", fontSize: 15, textTransform: "capitalize" }}>
            {s.view} {s.drill}
          </Text>
          <Text style={{ color: MUTED, fontSize: 13 }}>
            {new Date(s.startedAtUtc).toLocaleDateString()} · {s.deliveries.length} balls
            {s.video?.deleted ? " · video deleted" : ""}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
