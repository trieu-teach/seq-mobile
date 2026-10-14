import { SymbolView } from "expo-symbols";
import { useState, type PropsWithChildren, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "@/components/brand";
import { useAuth } from "@/features/auth/auth-context";
import { router } from "expo-router";
import { colors, radius, shadow, spacing, type } from "@/theme/tokens";

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}>;

export function Screen({ children, title, subtitle, action }: ScreenProps) {
  const { isGuest } = useAuth();
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {title ? <Text style={styles.title}>{title}</Text> : <Brand compact />}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.headerActions}>
            {action}
            <NotificationBell />
          </View>
        </View>
        {isGuest ? <View style={styles.guestBanner}><View style={styles.guestCopy}><Text style={styles.guestTitle}>Bạn đang xem với tư cách khách</Text><Text style={styles.guestText}>Khám phá nội dung mẫu; đăng nhập để xem gói và mở đầy đủ quyền lợi.</Text></View><Pressable onPress={() => router.push('/login')} style={styles.guestButton}><Text style={styles.guestButtonText}>Đăng nhập</Text></Pressable></View> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationBell() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable
        accessibilityLabel="Mở thông báo"
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
      >
        <SymbolView
          name={{ ios: "bell", android: "notifications", web: "notifications" }}
          size={23}
          tintColor={colors.ink}
          type="monochrome"
        />
      </Pressable>
      <Modal animationType="fade" onRequestClose={() => setVisible(false)} transparent visible={visible}>
        <Pressable onPress={() => setVisible(false)} style={styles.overlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
              <View>
                <Text style={styles.notificationEyebrow}>TRUNG TÂM CẬP NHẬT</Text>
                <Text style={styles.notificationTitle}>Thông báo</Text>
              </View>
              <Pressable accessibilityLabel="Đóng thông báo" onPress={() => setVisible(false)} style={styles.closeButton}>
                <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={colors.inkSoft} type="monochrome" />
              </Pressable>
            </View>
            <View style={styles.emptyIcon}>
              <SymbolView name={{ ios: "bell.slash", android: "notifications_off", web: "notifications_off" }} size={30} tintColor={colors.greenDark} type="monochrome" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo mới</Text>
            <Text style={styles.emptyText}>Các cập nhật về gói, lớp học và hồ sơ sẽ xuất hiện tại đây.</Text>
            <Pressable onPress={() => setVisible(false)} style={styles.doneButton}><Text style={styles.doneText}>Đã hiểu</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 4 },
  headerCopy: { flex: 1 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 9 },
  title: { ...type.h1, color: colors.ink },
  subtitle: { ...type.body, color: colors.muted, marginTop: 3 },
  bellButton: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", ...shadow.card },
  pressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  overlay: { flex: 1, justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 82, paddingHorizontal: spacing.lg, backgroundColor: "rgba(15,42,29,.24)" },
  notificationCard: { width: "100%", maxWidth: 370, padding: 19, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, ...shadow.large },
  notificationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  notificationEyebrow: { ...type.eyebrow, color: colors.greenDark },
  notificationTitle: { color: colors.ink, fontSize: 23, fontWeight: "900", marginTop: 3 },
  closeButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.canvas, alignItems: "center", justifyContent: "center" },
  emptyIcon: { width: 62, height: 62, borderRadius: 21, backgroundColor: colors.greenSoft, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 24 },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: "900", textAlign: "center", marginTop: 13 },
  emptyText: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 5, paddingHorizontal: 18 },
  doneButton: { height: 48, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", marginTop: 20 },
  doneText: { color: colors.white, fontSize: 12, fontWeight: "900" },
  guestBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.yellowSoft, borderWidth: 1, borderColor: "#E8D976" },
  guestCopy: { flex: 1 },
  guestTitle: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  guestText: { color: colors.inkSoft, fontSize: 9, lineHeight: 14, marginTop: 2 },
  guestButton: { minHeight: 40, paddingHorizontal: 13, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  guestButtonText: { color: colors.yellow, fontSize: 10, fontWeight: "900" },
});
