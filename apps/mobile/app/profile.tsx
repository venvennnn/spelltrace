import { ScrollView, Text, View } from "react-native";
import { demoWatchConnections, limits, providerCopy } from "@spelltrace/shared";

export default function Profile() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F6F1E8" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 32, fontFamily: "Georgia" }}>Profile</Text>
      <Text style={{ color: "#5C564E", marginTop: 8 }}>{limits.noMaleNorms}</Text>
      {demoWatchConnections.map((c) => (
        <View key={c.id} style={{ backgroundColor: "#FFFCF7", borderRadius: 16, padding: 12, marginTop: 10 }}>
          <Text style={{ fontWeight: "700" }}>{providerCopy[c.provider].title}</Text>
          <Text style={{ color: "#5C564E", marginTop: 4 }}>{c.live ? c.status : "Coming soon / native build"}</Text>
          <Text style={{ fontSize: 12, marginTop: 4 }}>{providerCopy[c.provider].experience}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
