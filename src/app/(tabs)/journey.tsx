import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { Card, Pill, Progress, SectionTitle } from "@/components/ui";
import {
  learnerDirectory,
  learnerGroups,
  servicePackages,
} from "@/data/dashboard";
import { useAuth } from "@/features/auth/auth-context";
import { colors, radius, shadow, type } from "@/theme/tokens";

export default function ManagementScreen() {
  const { session } = useAuth();
  const teacher = session?.role === "TEACHER";
  const pack = servicePackages[teacher ? "TEACHER" : "PARENT"];
  return (
    <Screen
      title={teacher ? "Lớp học & slot" : "Gia đình & slot"}
      subtitle={
        teacher
          ? "Quản lý lớp đang mở và các slot học sinh"
          : "Quản lý gia đình đang mở và các slot của con"
      }
    >
      <PackageCard
        name={pack.name}
        price={pack.price}
        used={pack.slotsUsed}
        limit={pack.slotsLimit}
      />
      {teacher ? <TeacherClasses /> : <FamilySlots />}
    </Screen>
  );
}

function PackageCard({
  name,
  price,
  used,
  limit,
}: {
  name: string;
  price: string;
  used: number;
  limit: number;
}) {
  return (
    <View style={styles.package}>
      <View style={styles.packageHead}>
        <View>
          <Text style={styles.packageLabel}>GÓI ĐANG SỬ DỤNG</Text>
          <Text style={styles.packageName}>{name}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>
        <Pill color={colors.greenSoft}>ĐANG HOẠT ĐỘNG</Pill>
      </View>
      <View style={styles.usage}>
        <Text style={styles.usageText}>
          Đã dùng {used}/{limit} slot
        </Text>
        <Text style={styles.usageText}>{limit - used} slot còn lại</Text>
      </View>
      <Progress value={(used / limit) * 100} color={colors.yellow} />
      <View style={styles.packageActions}>
        <Pressable
          onPress={() =>
            Alert.alert(
              "Tạo slot",
              "Chức năng sẽ gọi API tạo slot khi backend sẵn sàng.",
            )
          }
          style={styles.createSlot}
        >
          <Text style={styles.createSlotText}>＋ Tạo slot</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            Alert.alert(
              "Nâng cấp gói",
              "Màn thanh toán sẽ được nối với luồng mua gói của web.",
            )
          }
          style={styles.upgrade}
        >
          <Text style={styles.upgradeText}>Mua / nâng cấp gói</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FamilySlots() {
  const family = learnerGroups.find(
    (item) => item.context === "FAMILY" && item.status === "OPEN",
  );
  const slots = family?.memberIds
    .map((id) => learnerDirectory.find((item) => item.id === id))
    .filter((item): item is (typeof learnerDirectory)[number] => Boolean(item));
  return (
    <>
      <GroupHeader
        eyebrow="GIA ĐÌNH ĐANG MỞ"
        name={family?.name ?? "Chưa mở gia đình"}
        used={slots?.length ?? 0}
        limit={family?.slotLimit ?? 4}
      />
      {slots?.map((item) => (
        <LearnerRow key={item.id} item={item} />
      ))}
    </>
  );
}

function TeacherClasses() {
  const openClass = learnerGroups.find(
    (item) => item.context === "CLASS" && item.status === "OPEN",
  );
  const closedClasses = learnerGroups.filter(
    (item) => item.context === "CLASS" && item.status === "CLOSED",
  );
  const members = openClass?.memberIds
    .map((id) => learnerDirectory.find((item) => item.id === id))
    .filter((item): item is (typeof learnerDirectory)[number] => Boolean(item));

  return (
    <>
      <View style={styles.classSection}>
        <GroupHeader
          eyebrow={`LỚP ĐANG MỞ · NĂM HỌC ${openClass?.schoolYear ?? "—"}`}
          name={openClass?.name ?? "Chưa mở lớp"}
          used={members?.length ?? 0}
          limit={openClass?.slotLimit ?? 40}
        />
        {members?.map((member) => (
          <LearnerRow key={member.id} item={member} />
        ))}
      </View>

      {closedClasses.length > 0 && (
        <View style={styles.archiveSection}>
          <SectionTitle>Lớp đã kết thúc</SectionTitle>
          {closedClasses.map((item) => (
            <Card key={item.id} style={styles.archiveCard}>
              <View style={styles.archiveCopy}>
                <Text style={styles.archiveName}>{item.name}</Text>
                <Text style={styles.archiveMeta}>
                  Năm học {item.schoolYear} · Đã đóng {item.closedAt}
                </Text>
                <Text style={styles.archiveNote}>
                  Báo cáo đã được đông cứng · Slot đã hoàn trả
                </Text>
              </View>
              <Text style={styles.archiveLink}>Xem báo cáo ›</Text>
            </Card>
          ))}
        </View>
      )}
    </>
  );
}

function GroupHeader({
  eyebrow,
  name,
  used,
  limit,
}: {
  eyebrow: string;
  name: string;
  used: number;
  limit: number;
}) {
  return (
    <View style={styles.classHead}>
      <View style={styles.groupTitleCopy}>
        <Text style={styles.classLabel}>{eyebrow}</Text>
        <Text style={styles.className}>{name}</Text>
      </View>
      <View style={styles.classCount}>
        <Text style={styles.classCountValue}>{used}</Text>
        <Text style={styles.classCountLabel}>/{limit} slot</Text>
      </View>
    </View>
  );
}

function LearnerRow({
  item,
  compact = false,
}: {
  item: (typeof learnerDirectory)[number];
  compact?: boolean;
}) {
  const done = Number(item.chaptersDone);
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/learner/[id]",
          params: { id: item.id },
        } as never)
      }
      style={({ pressed }) => [styles.rowPress, pressed && styles.pressed]}
    >
      <View style={[styles.learner, compact && styles.learnerCompact]}>
        <View style={[styles.avatar, { backgroundColor: item.color }]}>
          <Text style={styles.avatarText}>{item.initial}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.code} · {done}/8 chương
          </Text>
        </View>
        <Pill color={colors.yellowSoft} textColor="#7C6200">
          CHƯƠNG {Math.min(done + 1, 8)}
        </Pill>
        <Text style={styles.arrow}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  package: {
    padding: 19,
    borderRadius: radius.xl,
    backgroundColor: colors.ink,
    ...shadow.card,
  },
  packageHead: { flexDirection: "row", justifyContent: "space-between" },
  packageLabel: { ...type.eyebrow, color: "#A9CABB" },
  packageName: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 5,
  },
  price: { color: "#C5D8CE", fontSize: 10, marginTop: 3 },
  usage: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  usageText: { color: "#C5D8CE", fontSize: 9 },
  packageActions: { flexDirection: "row", gap: 8, marginTop: 15 },
  createSlot: {
    flex: 1,
    height: 43,
    borderRadius: radius.md,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  createSlotText: { color: colors.ink, fontSize: 11, fontWeight: "900" },
  upgrade: {
    flex: 1,
    height: 43,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#557565",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeText: { color: colors.white, fontSize: 10, fontWeight: "900" },
  classSection: { gap: 10 },
  classHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupTitleCopy: { flex: 1, paddingRight: 12 },
  classLabel: { ...type.eyebrow, color: colors.green, fontSize: 8 },
  className: { ...type.h2, color: colors.ink, marginTop: 3 },
  classCount: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: colors.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  classCountValue: { color: colors.purple, fontSize: 18, fontWeight: "900" },
  classCountLabel: { color: colors.muted, fontSize: 8 },
  archiveSection: { gap: 10, marginTop: 8 },
  archiveCard: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  archiveCopy: { flex: 1 },
  archiveName: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  archiveMeta: { color: colors.muted, fontSize: 9, marginTop: 3 },
  archiveNote: { color: colors.greenDark, fontSize: 9, marginTop: 5 },
  archiveLink: { color: colors.purple, fontSize: 9, fontWeight: "900" },
  rowPress: { borderRadius: radius.md },
  learner: {
    minHeight: 72,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  learnerCompact: {
    minHeight: 62,
    padding: 8,
    marginTop: 7,
    backgroundColor: colors.canvas,
    shadowOpacity: 0,
    elevation: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.ink, fontWeight: "900" },
  copy: { flex: 1 },
  name: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 9, marginTop: 3 },
  arrow: { color: colors.greenDark, fontSize: 23 },
  pressed: { opacity: 0.7 },
});
