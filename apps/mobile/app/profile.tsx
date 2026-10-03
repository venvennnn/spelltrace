import { ScrollView, Text, View } from "react-native";
import { demoWatchConnections, providerCopy } from "@spelltrace/shared";

export default function Profile() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontFamily: "Georgia" }}>Profile</Text>
      {demoWatchConnections.map((c) => (
        <View key={c.id} style={{ borderWidth: 1, borderColor: "#E8E8E8", borderRadius: 16, padding: 12, marginTop: 8 }}>
          <Text style={{ fontWeight: "700" }}>{providerCopy[c.provider].title}</Text>
          <Text style={{ color: "#5C564E" }}>{c.live ? c.status : c.status === "coming_soon" ? "Coming soon" : "Native build"}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
