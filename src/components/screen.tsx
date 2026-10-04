import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, type } from '@/theme/tokens';
export function Screen({ children, title, subtitle, action }: PropsWithChildren<{ title?: string; subtitle?: string; action?: ReactNode }>) { return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{title && <View style={styles.header}><View style={styles.headerCopy}><Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>{action}</View>}{children}</ScrollView></SafeAreaView>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 6 }, headerCopy: { flex: 1 }, title: { ...type.h1, color: colors.ink }, subtitle: { ...type.body, color: colors.muted, marginTop: 3 } });
