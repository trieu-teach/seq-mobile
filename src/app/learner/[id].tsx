import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { reportsApi, type SlotReport } from "@/api";
import { NoticeBanner } from "@/components/feedback";
import { Card, Pill, Progress } from "@/components/ui";
import { chapterCatalog, indicatorMeta, type IndicatorKey } from "@/data/dashboard";
import { colors, radius, shadow, spacing, type } from "@/theme/tokens";

type ReportSection = "journey" | "indicators" | "achievements";

function formatActivity(value: string | null) {
  if (!value) return "Chưa có hoạt động";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export default function LearnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<SlotReport | null>(null);
  const [section, setSection] = useState<ReportSection>("journey");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try { setReport(await reportsApi.slot(id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được báo cáo người học."); }
    finally { setLoading(false); }
  }, [id]);

  // The initial server request intentionally owns this screen's loading state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  if (loading)
    return <SafeAreaView style={styles.empty}><ActivityIndicator color={colors.green} size="large" /></SafeAreaView>;
  if (!report)
    return (
      <SafeAreaView style={styles.empty}>
        <NoticeBanner kind="error" message={error || "Không tìm thấy người học."} />
        <Pressable onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Thử lại</Text></Pressable>
      </SafeAreaView>
    );
  const { learner, progress, indicators } = report;
  const displayName = learner.displayName ?? "Đã xóa dữ liệu";
  const chapters = Array.from({ length: Math.max(0, progress.totalChapters) }, (_, index) => index + 1);
  const currentChapter = progress.continueChapter && chapters.includes(progress.continueChapter) ? progress.continueChapter : null;
  const completedChapters = chapters.filter((chapter) => progress.chaptersDone.includes(chapter));
  const notStartedChapters = chapters.filter((chapter) => chapter !== currentChapter && !progress.chaptersDone.includes(chapter));
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
          <Text style={styles.headerName}>{displayName}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profile}>
          <Image source={require('../../../assets/images/finteen/learner-detail-bg-v3.png')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
          <View style={styles.profileShade} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.meta}>
              Mã {learner.code ?? "—"} · {learner.group.name}
            </Text>
            <Text style={styles.active}>Hoạt động: {formatActivity(learner.lastActiveAt)}</Text>
          </View>
          <Pill>{progress.completedChapters}/{progress.totalChapters}</Pill>
        </Card>
        <View style={styles.stats}>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>{progress.completedChapters}</Text>
            <Text style={styles.statLabel}>Đã xong</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>
              {progress.continueChapter ?? "—"}
            </Text>
            <Text style={styles.statLabel}>Đang mở</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>{progress.attemptIndex}</Text>
            <Text style={styles.statLabel}>Lượt chơi</Text>
          </Card>
        </View>
        <View style={styles.sectionTabs}>
          <SectionTab active={section === "journey"} label="Hành trình" onPress={() => setSection("journey")} />
          <SectionTab active={section === "indicators"} label="Chỉ số" onPress={() => setSection("indicators")} />
          <SectionTab active={section === "achievements"} label="Thành tựu" onPress={() => setSection("achievements")} />
        </View>

        {section === "journey" ? <View style={styles.sectionContent}>
          <View><Text style={styles.sectionEyebrow}>TIẾN ĐỘ HỌC TẬP</Text><Text style={styles.sectionTitle}>Hành trình {progress.totalChapters} chương</Text></View>
          {currentChapter ? <ChapterGroup title="Đang học" count={1} tone="current"><ChapterCard chapterNumber={currentChapter} status="current" /></ChapterGroup> : null}
          {completedChapters.length ? <ChapterGroup title="Đã hoàn thành" count={completedChapters.length} tone="complete">{completedChapters.map((chapter) => <ChapterCard key={chapter} chapterNumber={chapter} status="complete" />)}</ChapterGroup> : null}
          {notStartedChapters.length ? <ChapterGroup title="Chưa học" count={notStartedChapters.length} tone="pending">{notStartedChapters.map((chapter) => <ChapterCard key={chapter} chapterNumber={chapter} status="pending" />)}</ChapterGroup> : null}
          {!chapters.length ? <Card><Text style={styles.noData}>Chưa có chương học nào được phát hành.</Text></Card> : null}
        </View> : null}

        {section === "indicators" ? <View style={styles.sectionContent}>
          <View><Text style={styles.sectionEyebrow}>KẾT QUẢ MÔ PHỎNG</Text><Text style={styles.sectionTitle}>Năm chỉ số hiện tại</Text></View>
          {indicators ? <Card style={styles.indicatorCard}>
            {(Object.entries(indicators) as [IndicatorKey, number][]).map(([key, value]) => {
              const meta = indicatorMeta[key];
              const level = value < 34 ? "Thấp" : value < 67 ? "Vừa" : "Cao";
              return <View key={key} style={styles.indicator}>
                <View style={styles.indicatorHead}><Text style={styles.indicatorLabel}>{meta.label}</Text><Text style={[styles.indicatorValue, { color: meta.color }]}>{value} · {level}</Text></View>
                <Progress value={value} color={meta.color} />
              </View>;
            })}
          </Card> : <Card><Text style={styles.noData}>Người học chưa có dữ liệu chỉ số.</Text></Card>}
          <View style={styles.note}><Text style={styles.noteText}>Chỉ số phản ánh lựa chọn trong game, không phải điểm đúng–sai, đánh giá tính cách hoặc cơ sở để xếp hạng trẻ.</Text></View>
        </View> : null}

        {section === "achievements" ? <View style={styles.sectionContent}>
          <View><Text style={styles.sectionEyebrow}>DẤU MỐC ĐÃ ĐẠT</Text><Text style={styles.sectionTitle}>Thành tựu</Text></View>
          {report.achievements.length ? report.achievements.map((achievement) => <Card key={`${achievement.code}-${achievement.earnedAt}`} style={styles.achievement}><View style={styles.achievementIcon}><Text style={styles.achievementIconText}>★</Text></View><View style={styles.achievementCopy}><Text style={styles.achievementName}>{achievement.code}</Text><Text style={styles.achievementDate}>Đạt ngày {formatActivity(achievement.earnedAt)}</Text></View></Card>) : <Card style={styles.emptyState}><Text style={styles.emptyStateIcon}>☆</Text><Text style={styles.emptyStateTitle}>Chưa có thành tựu</Text><Text style={styles.emptyStateText}>Các huy hiệu và cột mốc sẽ xuất hiện tại đây khi người học đạt điều kiện.</Text></Card>}
        </View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.sectionTab, active && styles.sectionTabActive]}><Text style={[styles.sectionTabText, active && styles.sectionTabTextActive]}>{label}</Text></Pressable>;
}

function ChapterGroup({ title, count, tone, children }: { title: string; count: number; tone: "current" | "complete" | "pending"; children: ReactNode }) {
  return <View style={styles.chapterGroup}><View style={styles.chapterGroupHeader}><View style={[styles.statusMarker, tone === "current" ? styles.markerCurrent : tone === "complete" ? styles.markerComplete : styles.markerPending]} /><Text style={styles.chapterGroupTitle}>{title}</Text><View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View></View><View style={styles.chapterList}>{children}</View></View>;
}

function ChapterCard({ chapterNumber, status }: { chapterNumber: number; status: "current" | "complete" | "pending" }) {
  const metadata = chapterCatalog.find((item) => item.chapter === chapterNumber);
  const label = status === "complete" ? "ĐÃ HOÀN THÀNH" : status === "current" ? "ĐANG HỌC" : "CHƯA HỌC";
  return <Card style={[styles.chapter, status === "current" ? styles.chapterCurrent : status === "complete" ? styles.chapterComplete : styles.chapterPending]}>
    {metadata ? <Image source={metadata.image} style={styles.chapterImage} contentFit="cover" /> : <View style={[styles.chapterImage, styles.imageFallback]}><Text style={styles.imageFallbackText}>{chapterNumber}</Text></View>}
    <View style={styles.chapterCopy}><Text style={styles.chapterKicker}>CHƯƠNG {chapterNumber}</Text><Text numberOfLines={2} style={styles.chapterTitle}>{metadata?.title ?? `Chương ${chapterNumber}`}</Text><Text numberOfLines={1} style={styles.theme}>{metadata?.theme ?? "Nội dung học tập"}</Text></View>
    <View style={[styles.chapterStatus, status === "current" ? styles.statusCurrent : status === "complete" ? styles.statusComplete : styles.statusPending]}><Text style={[styles.chapterStatusText, status === "current" ? styles.statusCurrentText : status === "complete" ? styles.statusCompleteText : styles.statusPendingText]}>{label}</Text></View>
  </Card>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: 14 },
  retry: { minHeight: 46, paddingHorizontal: 20, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  retryText: { color: colors.yellow, fontWeight: "900" },
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
  profile: { minHeight: 205, flexDirection: "row", alignItems: "flex-end", gap: 12, overflow: "hidden", padding: 17 },
  profileShade: { position: "absolute", inset: 0, backgroundColor: "rgba(8,40,27,.48)" },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.yellow,
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: colors.ink },
  profileCopy: { flex: 1 },
  name: { color: colors.white, fontSize: 16, fontWeight: "900" },
  meta: { color: "#E4EFE9", fontSize: 10, marginTop: 3 },
  active: { color: colors.yellow, fontSize: 9, marginTop: 4 },
  stats: { flexDirection: "row", gap: 9 },
  stat: { flex: 1, padding: 12, alignItems: "center" },
  statValue: { color: colors.greenDark, fontSize: 21, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 9, marginTop: 3 },
  sectionTabs: { flexDirection: "row", gap: 6, padding: 5, borderRadius: 17, backgroundColor: "#E8ECE8" },
  sectionTab: { flex: 1, minHeight: 44, paddingHorizontal: 5, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  sectionTabActive: { backgroundColor: colors.ink, ...shadow.card },
  sectionTabText: { color: colors.muted, fontSize: 10, fontWeight: "800" },
  sectionTabTextActive: { color: colors.yellow, fontWeight: "900" },
  sectionContent: { gap: 14 },
  sectionEyebrow: { ...type.eyebrow, color: colors.green },
  sectionTitle: { ...type.h2, color: colors.ink, marginTop: 4 },
  chapterGroup: { gap: 9 },
  chapterGroupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusMarker: { width: 9, height: 9, borderRadius: 5 },
  markerCurrent: { backgroundColor: "#D09C00" },
  markerComplete: { backgroundColor: colors.green },
  markerPending: { backgroundColor: "#AAB3AE" },
  chapterGroupTitle: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  countBadge: { minWidth: 25, height: 23, paddingHorizontal: 7, borderRadius: 9, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line },
  countText: { color: colors.muted, fontSize: 9, fontWeight: "900" },
  chapterList: { gap: 9 },
  chapter: { minHeight: 102, padding: 10, overflow: "hidden", flexDirection: "row", alignItems: "center", gap: 11 },
  chapterCurrent: { borderWidth: 2, borderColor: "#DFC23A", backgroundColor: "#FFFDF2" },
  chapterComplete: { borderColor: "#B7DAC5", backgroundColor: "#FBFFFC" },
  chapterPending: { backgroundColor: "#F5F6F4", borderColor: "#DDE1DD" },
  chapterImage: { width: 78, height: 78, borderRadius: 15 },
  imageFallback: { backgroundColor: colors.greenSoft, alignItems: "center", justifyContent: "center" },
  imageFallbackText: { color: colors.greenDark, fontSize: 26, fontWeight: "900" },
  chapterCopy: { flex: 1, paddingRight: 76 },
  chapterKicker: { ...type.eyebrow, color: colors.green, fontSize: 8 },
  chapterTitle: { color: colors.ink, fontSize: 13, lineHeight: 17, fontWeight: "900", marginTop: 3 },
  theme: { color: colors.muted, fontSize: 9, marginTop: 3 },
  chapterStatus: { position: "absolute", right: 9, top: 8, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8 },
  statusCurrent: { backgroundColor: colors.yellowSoft },
  statusComplete: { backgroundColor: colors.greenSoft },
  statusPending: { backgroundColor: "#E6E9E7" },
  chapterStatusText: { fontSize: 7, fontWeight: "900" },
  statusCurrentText: { color: "#806500" },
  statusCompleteText: { color: colors.greenDark },
  statusPendingText: { color: colors.muted },
  indicatorCard: { gap: 19 },
  indicator: { gap: 8 },
  indicatorHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  indicatorLabel: { color: colors.inkSoft, fontSize: 12, fontWeight: "900" },
  indicatorValue: { fontSize: 11, fontWeight: "900" },
  noData: { color: colors.muted, fontSize: 11, textAlign: "center" },
  achievement: { flexDirection: "row", alignItems: "center", gap: 12 },
  achievementIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.yellowSoft, alignItems: "center", justifyContent: "center" },
  achievementIconText: { color: "#977700", fontSize: 24 },
  achievementCopy: { flex: 1 },
  achievementName: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  achievementDate: { color: colors.muted, fontSize: 9, marginTop: 3 },
  emptyState: { alignItems: "center", paddingVertical: 28 },
  emptyStateIcon: { color: colors.green, fontSize: 35 },
  emptyStateTitle: { color: colors.ink, fontSize: 15, fontWeight: "900", marginTop: 9 },
  emptyStateText: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: "center", marginTop: 5, maxWidth: 270 },
  note: {
    padding: 15,
    borderRadius: radius.lg,
    backgroundColor: colors.yellowSoft,
    ...shadow.card,
  },
  noteText: { color: "#756A3B", fontSize: 11, lineHeight: 17 },
});
