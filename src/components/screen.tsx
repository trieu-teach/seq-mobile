import { type PropsWithChildren, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "@/components/brand";
import { colors, spacing, type } from "@/theme/tokens";

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  scroll?: boolean;
}>;

export function Screen({ children, title, subtitle, action, scroll = true }: ScreenProps) {
  const content = <>
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {title ? <Text style={styles.title}>{title}</Text> : <Brand compact />}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.headerActions}>{action}</View>
    </View>
    {children}
  </>;
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {scroll ? <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{content}</ScrollView> : <View style={[styles.content, styles.staticContent]}>{content}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  staticContent: { flex: 1, paddingBottom: 0 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 4 },
  headerCopy: { flex: 1 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 9 },
  title: { ...type.h1, color: colors.ink },
  subtitle: { ...type.body, color: colors.muted, marginTop: 3 },
});
