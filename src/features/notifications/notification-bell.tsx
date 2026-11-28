import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { notificationsApi } from '@/api';
import { colors, shadow } from '@/theme/tokens';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const refresh = useCallback(async () => {
    try { const result = await notificationsApi.unreadCount(); setUnreadCount(Math.max(0, Number(result.unreadCount) || 0)); }
    catch { /* Badge refresh must not interrupt the current screen. */ }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  useEffect(() => { const timer = setInterval(() => void refresh(), 60_000); return () => clearInterval(timer); }, [refresh]);
  return <Pressable accessibilityLabel={unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'} accessibilityRole="button" hitSlop={8} onPress={() => router.push('/notifications' as never)} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
    <SymbolView name={{ ios: unreadCount ? 'bell.fill' : 'bell', android: 'notifications', web: 'notifications' }} size={22} tintColor={colors.greenDark} type="monochrome" />
    {unreadCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  badge: { position: 'absolute', top: -4, right: -5, minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, backgroundColor: colors.coral, borderWidth: 2, borderColor: colors.canvas, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '900' },
});
