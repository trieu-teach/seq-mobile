import { Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { useAuth } from "@/features/auth/auth-context";
import { colors } from "@/theme/tokens";

const icons: Record<string, string> = {
  index: "⌂",
  journey: "♙",
  quiz: "◈",
  rewards: "✦",
  profile: "●",
};

export default function TabsLayout() {
  const { session } = useAuth();
  const teacher = session?.role === "TEACHER";
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.greenDark,
        tabBarInactiveTintColor: "#8A9690",
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        tabBarIcon: ({ focused, color }) => (
          <Text style={[styles.icon, { color }, focused && styles.activeIcon]}>
            {icons[route.name]}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Tổng quan" }} />
      <Tabs.Screen
        name="journey"
        options={{ title: teacher ? "Lớp học" : "Gia đình" }}
      />
      <Tabs.Screen
        name="quiz"
        options={{ title: teacher ? "Quiz" : "Kiến thức" }}
      />
      <Tabs.Screen name="rewards" options={{ title: "Tổng kết" }} />
      <Tabs.Screen name="profile" options={{ title: "Tài khoản" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 76,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderTopColor: colors.line,
  },
  label: { fontSize: 9, fontWeight: "800" },
  icon: { fontSize: 20, lineHeight: 22 },
  activeIcon: { transform: [{ scale: 1.12 }] },
});
