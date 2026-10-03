import { Tabs } from "expo-router";
import { nav, product } from "@spelltrace/shared";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: product.name,
        tabBarActiveTintColor: "#1F6B66",
        tabBarStyle: { minHeight: 56 },
        headerStyle: { backgroundColor: "#F6F1E8" },
        headerTitleStyle: { fontFamily: "Georgia" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: nav.today }} />
      <Tabs.Screen name="sessions" options={{ title: nav.sessions }} />
      <Tabs.Screen name="add" options={{ title: nav.add }} />
      <Tabs.Screen name="review" options={{ title: nav.review }} />
      <Tabs.Screen name="profile" options={{ title: nav.profile }} />
    </Tabs>
  );
}
