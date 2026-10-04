import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Pill, Progress } from "@/components/ui";
import {
  chapterCatalog,
  indicatorMeta,
  learnerDirectory,
  learners,
} from "@/data/dashboard";
import { colors, radius, shadow, spacing, type } from "@/theme/tokens";

export default function LearnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = learnerDirectory.find((item) => item.id === id);
  if (!person)
    return (
      <SafeAreaView style={styles.empty}>
        <Text>Không tìm thấy người học.</Text>
      </SafeAreaView>
    );
  const anResults = person.id === "slot-an" ? learners[0].chapters : [];
  const indicators = {
    wealth: 40 + person.chaptersDone * 2,
    saving: 25 + person.chaptersDone * 3,
    happiness: 55 + person.chaptersDone,
    risk: 48 - person.chaptersDone * 2,
    goal: 38 + person.chaptersDone * 4,
  };
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)/journey")
          }
          style={styles.back}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerLabel}>HỒ SƠ NGƯỜI HỌC</Text>
          <Text style={styles.headerName}>{person.name}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: person.color }]}>
            <Text style={styles.avatarText}>{person.initial}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.meta}>
              Mã {person.code} · {person.group}
            </Text>
            <Text style={styles.active}>Hoạt động: {person.lastActive}</Text>
          </View>
          <Pill>{person.chaptersDone}/8</Pill>
        </Card>
        <View style={styles.stats}>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>{person.chaptersDone}</Text>
            <Text style={styles.statLabel}>Đã xong</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>
              {Math.min(person.chaptersDone + 1, 8)}
            </Text>
            <Text style={styles.statLabel}>Đang mở</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Lượt chơi</Text>
          </Card>
        </View>
        <Text style={styles.sectionTitle}>Hành trình 8 chương</Text>
        {chapterCatalog.map((chapter) => {
          const complete = chapter.chapter <= person.chaptersDone;
          const current = chapter.chapter === person.chaptersDone + 1;
          const result = anResults.find(
            (item) => item.chapter === chapter.chapter,
          );
          return (
            <Card
              key={chapter.chapter}
              style={[styles.chapter, !complete && !current && styles.locked]}
            >
              <Image
                source={chapter.image}
                style={styles.image}
                contentFit="cover"
              />
              <View style={styles.imageShade} />
              <View style={styles.chapterNumber}>
                <Text style={styles.chapterNumberText}>{chapter.chapter}</Text>
              </View>
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.theme}>{chapter.theme}</Text>
                <View style={styles.statusRow}>
                  <Pill
                    color={
                      complete
                        ? colors.greenSoft
                        : current
                          ? colors.yellowSoft
                          : "#ECEFED"
                    }
                    textColor={
                      complete
                        ? colors.greenDark
                        : current
                          ? "#7C6200"
                          : colors.muted
                    }
                  >
                    {complete
                      ? "ĐÃ HOÀN THÀNH"
                      : current
                        ? "ĐANG MỞ"
                        : "CHƯA MỞ"}
                  </Pill>
                  {result && (
                    <Text style={styles.result}>
                      {result.correct}/{result.total} mini-game đúng
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          );
        })}
        <Text style={styles.sectionTitle}>Năm chỉ số hiện tại</Text>
        <Card>
          {Object.entries(indicators).map(([key, value]) => {
            const meta = indicatorMeta[key as keyof typeof indicatorMeta];
            return (
              <View key={key} style={styles.indicator}>
                <Text style={styles.indicatorLabel}>{meta.label}</Text>
                <View style={styles.indicatorProgress}>
                  <Progress value={value} color={meta.color} />
                </View>
                <Text style={[styles.indicatorValue, { color: meta.color }]}>
                  {value}
                </Text>
              </View>
            );
          })}
        </Card>
        <View style={styles.note}>
          <Text style={styles.noteText}>
            Chỉ số là kết quả mô phỏng từ lựa chọn trong game, không phải điểm
            đúng–sai hay đánh giá tính cách.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    height: 68,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  back: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 30, lineHeight: 31, color: colors.ink },
  headerCopy: { flex: 1 },
  headerLabel: { ...type.eyebrow, color: colors.green, fontSize: 9 },
  headerName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 2,
  },
  content: { padding: spacing.lg, paddingBottom: 50, gap: spacing.lg },
  profile: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: colors.ink },
  profileCopy: { flex: 1 },
  name: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 10, marginTop: 3 },
  active: { color: colors.greenDark, fontSize: 9, marginTop: 4 },
  stats: { flexDirection: "row", gap: 9 },
  stat: { flex: 1, padding: 12, alignItems: "center" },
  statValue: { color: colors.greenDark, fontSize: 21, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 9, marginTop: 3 },
  sectionTitle: { ...type.h2, color: colors.ink },
  chapter: { height: 190, padding: 0, overflow: "hidden" },
  locked: { opacity: 0.58 },
  image: { width: "100%", height: 105 },
  imageShade: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 105,
    backgroundColor: "rgba(20,38,29,.18)",
  },
  chapterNumber: {
    position: "absolute",
    left: 12,
    top: 12,
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterNumberText: { color: colors.white, fontWeight: "900" },
  chapterInfo: { padding: 13 },
  chapterTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  theme: {
    color: colors.greenDark,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
  },
  result: { color: colors.muted, fontSize: 9 },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 8,
  },
  indicatorLabel: {
    width: 70,
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  indicatorProgress: { flex: 1 },
  indicatorValue: { width: 28, textAlign: "right", fontWeight: "900" },
  note: {
    padding: 15,
    borderRadius: radius.lg,
    backgroundColor: colors.yellowSoft,
    ...shadow.card,
  },
  noteText: { color: "#756A3B", fontSize: 11, lineHeight: 17 },
});
