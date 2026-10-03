import { ScrollView, Text, View } from "react-native";
import { demoWatchConnections, providerCopy } from "@spelltrace/shared";

const MUTED = "#66665F";
const LINE = "#D9D6CC";
const BRICK = "#A63A2E";

export default function Profile() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 34, fontFamily: "Georgia", fontWeight: "600" }}>Watch</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 8 }}>
        <View style={{ width: 48, height: 3, backgroundColor: BRICK }} />
        <View style={{ flex: 1, height: 1, backgroundColor: LINE }} />
      </View>
      {demoWatchConnections.map((c) => (
        <View key={c.id} style={{ borderTopWidth: 1, borderColor: LINE, paddingVertical: 12 }}>
          <Text style={{ fontWeight: "500" }}>{providerCopy[c.provider].title}</Text>
          <Text style={{ color: MUTED }}>{c.live ? c.status : c.status === "coming_soon" ? "Coming soon" : "Native build"}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
