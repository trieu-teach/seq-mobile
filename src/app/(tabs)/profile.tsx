import { router } from "expo-router";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { Card, Pill } from "@/components/ui";
import { useWorkspaceData } from "@/features/account/use-workspace-data";
import { useAuth } from "@/features/auth/auth-context";
import { colors, radius, type } from "@/theme/tokens";

export default function ProfileScreen() {
  const { session, setRole, signOut } = useAuth();
  const { group, quota } = useWorkspaceData();
  const teacher = session?.role === "TEACHER";
  const contextRow = teacher
    ? (["🏫", "Lớp đang quản lý", group?.name ?? "Chưa có lớp"] as const)
    : (["👨‍👩‍👧", "Gia đình", group?.name ?? "Chưa có nhóm"] as const);
  const rows = [
    contextRow,
    ["🔒", "Đổi mật khẩu", "Cập nhật mật khẩu đăng nhập"],
    ["📊", "Báo cáo học tập", teacher ? "Tiến độ và kết quả của học sinh" : "Tiến độ và kết quả học tập của con"],
  ] as const;

  function openMenuItem(title: string) {
    if (title === "Đổi mật khẩu") {
      router.push("/change-password" as never);
    } else if (title === "Lớp đang quản lý" || title === "Gia đình") {
      router.push("/(tabs)/journey" as never);
    } else if (title === "Báo cáo học tập") {
      router.push("/(tabs)/rewards" as never);
    }
  }

  async function logout() {
    await signOut();
    router.replace("/login");
  }

  return (
    <Screen title="Tài khoản">
      <View style={styles.hero}>
        <Image source={require('../../../assets/images/finteen/profile-bg-v3.png')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{teacher ? "GV" : "PH"}</Text>
        </View>
        <Text style={styles.name}>{session?.displayName}</Text>
        <Text style={styles.email}>{session?.email}</Text>
        <Pill>{teacher ? "GIÁO VIÊN" : "PHỤ HUYNH"}</Pill>
        </View>
      </View>

      {session && session.account.plans.length > 1 ? (
        <Card style={styles.switchCard}>
          <Text style={styles.contextLabel}>CHUYỂN KHÔNG GIAN SỬ DỤNG</Text>
          <View style={styles.switchRow}>
            <Pressable onPress={() => setRole("PARENT")} style={[styles.roleButton, !teacher && styles.roleButtonActive]}>
              <Text style={[styles.roleButtonText, !teacher && styles.roleButtonTextActive]}>Phụ huynh</Text>
            </Pressable>
            <Pressable onPress={() => setRole("TEACHER")} style={[styles.roleButton, teacher && styles.roleButtonActive]}>
              <Text style={[styles.roleButtonText, teacher && styles.roleButtonTextActive]}>Giáo viên</Text>
            </Pressable>
          </View>
        </Card>
      ) : null}

      <Card style={styles.context}>
        <View style={styles.planCopy}>
          <Text style={styles.contextLabel}>
            {teacher ? "LỚP CỦA BẠN" : "GIA ĐÌNH CỦA BẠN"}
          </Text>
          <Text style={styles.contextName}>
            {group?.name ?? (teacher ? "Chưa có lớp đang mở" : "Chưa có nhóm đang mở")}
          </Text>
        </View>
        <View style={styles.active}>
          <Text style={styles.activeText}>ĐANG HOẠT ĐỘNG</Text>
        </View>
      </Card>

      <Card style={styles.context}>
        <View style={styles.planCopy}>
          <Text style={styles.contextLabel}>CÁC GÓI DỊCH VỤ</Text>
          <Text style={styles.contextName}>Xem hạn mức hoặc mua thêm lượt hồ sơ</Text>
          {session?.account.plans.includes(session.role) ? <Text style={styles.planMeta}>Quyền sử dụng vĩnh viễn · còn {quota?.free ?? 0} lượt hồ sơ</Text> : null}
        </View>
        <Pressable onPress={() => router.push('/subscribe' as never)} style={styles.planButton}><Text style={styles.planButtonText}>Xem các gói</Text></Pressable>
      </Card>

      <Card style={styles.menu}>
        {rows.map(([icon, title, description], index) => (
          <Pressable
            key={title}
            onPress={() => openMenuItem(title)}
            style={[styles.row, index < rows.length - 1 && styles.rowBorder]}
          >
            <View style={styles.rowIcon}>
              <Text>{icon}</Text>
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{title}</Text>
              <Text style={styles.rowDescription}>{description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </Card>

      <Pressable onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
      <Text style={styles.version}>
        FinTeen phiên bản 1.0.0 · Dành cho người lớn
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 225, borderRadius: radius.xl, overflow: "hidden", justifyContent: "flex-end", padding: 20 },
  heroShade: { position: "absolute", inset: 0, backgroundColor: "rgba(8,40,27,.5)" },
  heroContent: { width: "62%", alignItems: "flex-start" },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.greenDark, fontSize: 22, fontWeight: "900" },
  name: { ...type.h2, color: colors.white, marginTop: 12 },
  email: { color: "#E4EFE9", fontSize: 12, marginVertical: 8 },
  switchCard: { gap: 12 },
  switchRow: { flexDirection: "row", gap: 8 },
  roleButton: { flex: 1, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas },
  roleButtonActive: { backgroundColor: colors.green, borderColor: colors.green },
  roleButtonText: { color: colors.muted, fontWeight: "900", fontSize: 12 },
  roleButtonTextActive: { color: colors.white },
  context: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contextLabel: { ...type.eyebrow, color: colors.green },
  contextName: { color: colors.ink, fontWeight: "900", marginTop: 4 },
  active: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radius.round,
    backgroundColor: colors.greenSoft,
  },
  activeText: { color: colors.greenDark, fontSize: 9, fontWeight: "900" },
  planButton: { minHeight: 42, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  planCopy: { flex: 1, paddingRight: 10 },
  planButtonText: { color: colors.yellow, fontSize: 10, fontWeight: "900" },
  planMeta: { color: colors.muted, fontSize: 9, marginTop: 4 },
  menu: { paddingVertical: 4, paddingHorizontal: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.ink, fontWeight: "800", fontSize: 14 },
  rowDescription: { color: colors.muted, fontSize: 10, marginTop: 2 },
  chevron: { color: colors.muted, fontSize: 25 },
  logout: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "#F0B9AA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.coralSoft,
  },
  logoutText: { color: "#B44F35", fontWeight: "900" },
  version: { textAlign: "center", color: colors.muted, fontSize: 10 },
});
