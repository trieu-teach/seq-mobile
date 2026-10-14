import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { router } from "expo-router";
import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "@/components/brand";
import { colors, radius, shadow, spacing } from "@/theme/tokens";

type Props = PropsWithChildren<{ eyebrow: string; title: string; subtitle: string; accent?: string; background: number }>;

export function AuthScreen({ eyebrow, title, subtitle, accent = "●", background, children }: Props) {
  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.top}>
            <Pressable accessibilityLabel="Quay lại" onPress={goBack} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
            <Brand />
          </View>
          <View style={styles.hero}>
            <Image source={background} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
            <LinearGradient colors={["rgba(10,43,29,.98)", "rgba(10,43,29,.76)", "rgba(10,43,29,.08)"]} end={{ x: 1, y: 0 }} start={{ x: 0, y: 0 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.accent}>{accent}</Text>
            <Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F2E9" }, flex: { flex: 1 }, content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: 28 },
  top: { height: 68, flexDirection: "row", alignItems: "center", gap: 12 },
  back: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#DDE1D9", alignItems: "center", justifyContent: "center" }, backText: { color: colors.ink, fontSize: 28, lineHeight: 30 },
  hero: { minHeight: 210, borderRadius: radius.xl, padding: 20, overflow: "hidden", ...shadow.large },
  glow: { position: "absolute", width: 190, height: 190, borderRadius: 95, right: -58, top: -58, backgroundColor: "rgba(217,238,89,.13)" },
  spark: { position: "absolute", width: 12, height: 12, borderRadius: 4, right: 32, top: 32, backgroundColor: "#D9EE59", transform: [{ rotate: "18deg" }] },
  accent: { width: 46, height: 46, borderRadius: 16, backgroundColor: "rgba(255,255,255,.12)", color: "#D9EE59", textAlign: "center", textAlignVertical: "center", fontSize: 22, fontWeight: "900", overflow: "hidden" },
  eyebrow: { color: "#D9EE59", fontSize: 9, fontWeight: "900", letterSpacing: 1.2, marginTop: 14 },
  title: { color: "#FFFDF8", fontFamily: "Fraunces_700Bold", fontSize: 29, lineHeight: 34, letterSpacing: -0.5, marginTop: 5 },
  subtitle: { color: "#C7D9D0", fontSize: 12, lineHeight: 18, marginTop: 6, maxWidth: 310 },
  card: { marginTop: 14, marginHorizontal: 1, padding: 18, borderRadius: 24, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E1E4DC", ...shadow.card },
});
