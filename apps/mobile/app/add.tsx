import { ScrollView, Text, TextInput, View } from "react-native";

export default function Add() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F6F1E8" }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 32, fontFamily: "Georgia" }}>New session</Text>
      <Text style={{ color: "#5C564E", marginVertical: 8 }}>
        Upload from camera or gallery. Store date, time, and timezone explicitly. Watch CSV is optional.
      </Text>
      {["Timezone", "Bowling arm", "View", "Drill", "Effort"].map((label) => (
        <View key={label} style={{ marginTop: 10 }}>
          <Text>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            style={{ minHeight: 44, borderWidth: 1, borderColor: "#E4DCD0", borderRadius: 12, padding: 10, backgroundColor: "#FFFCF7" }}
          />
        </View>
      ))}
    </ScrollView>
  );
}
