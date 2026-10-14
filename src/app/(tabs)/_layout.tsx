import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/features/auth/auth-context";
import { colors, shadow } from "@/theme/tokens";

const icons = {
  index: { ios: "house.fill", android: "home", web: "home" },
  journey: { ios: "person.2.fill", android: "groups", web: "groups" },
  quiz: { ios: "questionmark.circle.fill", android: "quiz", web: "quiz" },
  rewards: { ios: "sparkles", android: "workspace_premium", web: "workspace_premium" },
  profile: { ios: "person.crop.circle.fill", android: "account_circle", web: "account_circle" },
} as const;

export default function TabsLayout() {
  const { session } = useAuth();
  const teacher = session?.role === "TEACHER";
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: "#87938C",
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.item,
        tabBarStyle: styles.bar,
        tabBarIcon: ({ focused }) => (
          <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <SymbolView
              name={icons[route.name as keyof typeof icons] as never}
              size={focused ? 22 : 21}
              tintColor={focused ? colors.yellow : "#87938C"}
              type="monochrome"
            />
          </View>
        ),
        tabBarLabel: ({ children, focused }) => (
          <Text numberOfLines={1} style={[styles.label, focused && styles.labelActive]}>{children}</Text>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Tổng quan" }} />
      <Tabs.Screen name="journey" options={{ title: teacher ? "Lớp học" : "Gia đình" }} />
      <Tabs.Screen name="quiz" options={{ title: "Quiz", href: teacher ? undefined : null }} />
      <Tabs.Screen name="rewards" options={{ title: "Tổng kết", href: null }} />
      <Tabs.Screen name="profile" options={{ title: "Tài khoản" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 84,
    paddingTop: 7,
    paddingBottom: 9,
    paddingHorizontal: 5,
    backgroundColor: colors.white,
    borderTopWidth: 0,
    ...shadow.large,
  },
  item: { paddingVertical: 2 },
  iconWrap: {
    width: 44,
    height: 34,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.ink,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    color: "#87938C",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  labelActive: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "900",
  },
});
