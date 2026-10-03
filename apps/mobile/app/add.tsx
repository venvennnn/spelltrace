import { ScrollView, Text, TextInput, View } from "react-native";

export default function Add() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontFamily: "Georgia" }}>New session</Text>
      {["Timezone", "Bowling arm", "View", "Drill", "Effort"].map((label) => (
        <View key={label} style={{ marginTop: 10 }}>
          <Text>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            style={{ minHeight: 44, borderWidth: 1, borderColor: "#E8E8E8", borderRadius: 12, padding: 10 }}
          />
        </View>
      ))}
    </ScrollView>
  );
}
