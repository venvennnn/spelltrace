import { Tabs } from "expo-router";
import { nav, product } from "@spelltrace/shared";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: product.name,
        tabBarActiveTintColor: "#A63A2E",
        tabBarInactiveTintColor: "#66665F",
        tabBarStyle: { minHeight: 56, borderTopColor: "#D9D6CC", backgroundColor: "#fff" },
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontFamily: "Georgia", fontWeight: "600" },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: nav.today }} />
      <Tabs.Screen name="review" options={{ title: nav.review }} />
      <Tabs.Screen name="add" options={{ title: nav.add }} />
      <Tabs.Screen name="sessions" options={{ title: nav.sessions }} />
      <Tabs.Screen name="profile" options={{ title: nav.profile }} />
    </Tabs>
  );
}
