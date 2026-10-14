import { router } from "expo-router";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { Card, Pill } from "@/components/ui";
import { useWorkspaceData } from "@/features/account/use-workspace-data";
import { useAuth } from "@/features/auth/auth-context";
import { colors, radius, type } from "@/theme/tokens";

const commonRows = [
  ["👤", "Thông tin tài khoản", "Tên, email và vai trò"],
  ["🔔", "Thông báo", "Tổng kết và thành tích mới"],
  ["🔒", "Quyền riêng tư", "Cách FinTeen sử dụng dữ liệu"],
] as const;

export default function ProfileScreen() {
  const { isGuest, session, setRole, signOut } = useAuth();
  const { entitlement, group } = useWorkspaceData();
  const teacher = session?.role === "TEACHER";
  const contextRow = teacher
    ? (["🏫", "Lớp đang quản lý", group?.name ?? "Chưa có lớp"] as const)
    : (["👨‍👩‍👧", "Gia đình", group?.name ?? "Chưa có nhóm"] as const);
  const rows = [commonRows[0], contextRow, ...commonRows.slice(1)];

  function openMenuItem(title: string) {
    if (title === "Thông tin tài khoản") {
      router.push("/change-password" as never);
    } else if (title === "Các gói dịch vụ") {
      router.push("/subscribe" as never);
    }
  }

  async function logout() {
    await signOut();
    router.replace("/login");
  }

  if (isGuest) return <Screen title="Tài khoản"><View style={styles.guestHero}><View style={styles.avatar}><Text style={styles.avatarText}>K</Text></View><Text style={styles.guestTitle}>Khách FinTeen</Text><Text style={styles.guestText}>Bạn đang xem giao diện bằng dữ liệu mẫu. Demo game và các thao tác thay đổi dữ liệu được khóa.</Text></View><Card><Text style={styles.contextLabel}>MỞ ĐẦY ĐỦ QUYỀN LỢI</Text><Text style={styles.contextName}>Đăng nhập để xem gói, lưu tiến độ và quản lý hồ sơ</Text><Pressable onPress={() => router.push('/login')} style={styles.guestPrimary}><Text style={styles.guestPrimaryText}>Đăng nhập</Text></Pressable><Pressable onPress={() => router.push('/register' as never)} style={styles.guestLogin}><Text style={styles.guestLoginText}>Chưa có tài khoản? Đăng ký</Text></Pressable></Card><Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>Thoát chế độ khách</Text></Pressable></Screen>;

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
          <Text style={styles.contextName}>Xem hạn mức, mua thêm hoặc gia hạn</Text>
          {entitlement ? <Text style={styles.planMeta}>Gói hiện tại dùng đến {entitlement.expiresOn}</Text> : null}
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
  guestHero: { minHeight: 235, borderRadius: radius.xl, padding: 22, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  guestTitle: { color: colors.white, fontSize: 22, fontWeight: "900", marginTop: 13 },
  guestText: { color: "#C6D9CF", fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 7, maxWidth: 285 },
  guestPrimary: { height: 52, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", marginTop: 18 },
  guestPrimaryText: { color: colors.yellow, fontSize: 13, fontWeight: "900" },
  guestLogin: { height: 46, alignItems: "center", justifyContent: "center" },
  guestLoginText: { color: colors.greenDark, fontSize: 12, fontWeight: "900" },
});
