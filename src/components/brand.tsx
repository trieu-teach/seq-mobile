import { Image } from "expo-image";
import { StyleSheet } from "react-native";

const logo = require("../../assets/images/finteen-logo-v2.png");

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Image accessibilityLabel="FinTeen" contentFit="contain" source={logo} style={compact ? styles.compact : styles.logo} />;
}

const styles = StyleSheet.create({
  logo: { width: 132, height: 44 },
  compact: { width: 94, height: 34 },
});
