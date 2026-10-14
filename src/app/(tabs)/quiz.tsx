import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { Card, Pill, Progress, SectionTitle } from "@/components/ui";
import { learnerDirectory, learners, quizLiveProgress } from "@/data/dashboard";
import { useAuth } from "@/features/auth/auth-context";
import { useQuizStore } from "@/features/quiz/quiz-store";
import { colors, radius, shadow, type } from "@/theme/tokens";

export default function QuizScreen() {
  const { isGuest, session } = useAuth();
  return session?.role === "TEACHER" ? <TeacherQuiz /> : <ParentKnowledge isGuest={isGuest} />;
}

function TeacherQuiz() {
  const { quizzes } = useQuizStore();
  return (
    <Screen
      title="Quiz lớp học"
      subtitle="Tạo đề và theo dõi tiến độ làm bài của từng học sinh"
    >
      <View style={styles.teacherHero}>
        <Image source={require('../../../assets/images/finteen/quiz-teacher-bg-v3.png')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>KHÔNG GIAN GIÁO VIÊN</Text>
          <Text style={styles.heroTitle}>Quiz đang diễn ra</Text>
          <Text style={styles.heroText}>Lớp 10A2 · Chi tiêu thông minh</Text>
        <Pressable
          onPress={() => router.push("/quiz/create")}
          style={styles.create}
        >
          <Text style={styles.createText}>＋ Tạo Quiz</Text>
        </Pressable></View>
      </View>
      <View style={styles.stats}>
        <Stat value="4" label="Học sinh" />
        <Stat value="2" label="Đang làm" />
        <Stat value="1" label="Đã nộp" />
        <Stat value="1" label="Chưa bắt đầu" />
      </View>
      <SectionTitle>Tiến độ trực tiếp</SectionTitle>
      {quizLiveProgress.map((item) => {
        const learner = learnerDirectory.find(
          (value) => value.id === item.learnerId,
        )!;
        const status =
          item.status === "SUBMITTED"
            ? "ĐÃ NỘP"
            : item.status === "DOING"
              ? "ĐANG LÀM"
              : "CHƯA BẮT ĐẦU";
        return (
          <Pressable
            key={item.learnerId}
            onPress={() =>
              router.push({
                pathname: "/learner/[id]",
                params: { id: learner.id },
              } as never)
            }
          >
            <Card style={styles.student}>
              <View
                style={[
                  styles.studentAvatar,
                  { backgroundColor: learner.color },
                ]}
              >
                <Text style={styles.studentInitial}>{learner.initial}</Text>
              </View>
              <View style={styles.studentCopy}>
                <View style={styles.studentTop}>
                  <Text style={styles.studentName}>{learner.name}</Text>
                  <Pill
                    color={
                      item.status === "SUBMITTED"
                        ? colors.greenSoft
                        : item.status === "DOING"
                          ? colors.yellowSoft
                          : "#ECEFED"
                    }
                    textColor={
                      item.status === "SUBMITTED" ? colors.greenDark : "#6E6250"
                    }
                  >
                    {status}
                  </Pill>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progress}>
                    <Progress
                      value={(item.current / item.total) * 100}
                      color={
                        item.status === "SUBMITTED"
                          ? colors.green
                          : colors.purple
                      }
                    />
                  </View>
                  <Text style={styles.question}>
                    {item.current}/{item.total} câu
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        );
      })}
      <SectionTitle>Quiz của bạn</SectionTitle>
      {quizzes.map((quiz) => (
        <Card key={quiz.id} style={styles.quizCard}>
          <View style={styles.quizIcon}>
            <Text style={styles.quizIconText}>?</Text>
          </View>
          <View style={styles.quizCopy}>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizMeta}>
              {quiz.questions.length} câu ·{" "}
              {quiz.status === "ready" ? "Sẵn sàng" : "Bản nháp"}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      ))}
    </Screen>
  );
}

function ParentKnowledge({ isGuest }: { isGuest: boolean }) {
  const learner = learners[0];
  return (
    <Screen
      title="Kiến thức tài chính"
      subtitle="Kết quả mini-game và quiz của trẻ"
    >
      {isGuest ? <Card style={styles.demoLock}><View style={styles.demoLockIcon}><Text style={styles.demoLockIconText}>🔒</Text></View><View style={styles.quizCopy}><Text style={styles.quizTitle}>Demo game dành cho thành viên</Text><Text style={styles.quizMeta}>Bạn vẫn xem được nội dung mẫu bên dưới. Đăng nhập để xem gói và mở quyền chơi.</Text></View><Pressable onPress={() => router.push('/login')} style={styles.unlock}><Text style={styles.unlockText}>Đăng nhập</Text></Pressable></Card> : null}
      <View style={styles.parentHero}>
        <Image source={require('../../../assets/images/finteen/quiz-parent-bg-v3.png')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
        <Text style={styles.heroEyebrow}>MỨC NẮM KHÁI NIỆM</Text>
        <Text style={styles.heroTitle}>
          {learner.mastery.filter((item) => item.value >= 0.95).length}/
          {learner.mastery.length} khái niệm đã đạt ngưỡng
        </Text>
        <Text style={styles.heroText}>
          Kết quả chỉ lấy từ câu hỏi có đúng–sai, không dùng lựa chọn thiên
          hướng.
        </Text>
        </View>
      </View>
      {learner.mastery.map((item) => (
        <Card key={item.code} style={styles.concept}>
          <View style={styles.conceptTop}>
            <View style={styles.quizCopy}>
              <Text style={styles.quizTitle}>{item.concept}</Text>
              <Text style={styles.quizMeta}>{item.code}</Text>
            </View>
            <Text style={styles.mastery}>{Math.round(item.value * 100)}%</Text>
          </View>
          <Progress
            value={item.value * 100}
            color={item.value >= 0.95 ? colors.green : colors.yellow}
          />
        </Card>
      ))}
      <SectionTitle>Kết quả theo chương</SectionTitle>
      {learner.chapters.map((item) => (
        <Card key={item.chapter} style={styles.result}>
          <Image
            source={item.image}
            style={styles.resultImage}
            contentFit="cover"
          />
          <View style={styles.quizCopy}>
            <Text style={styles.quizTitle}>{item.title}</Text>
            <Text style={styles.quizMeta}>
              {item.correct}/{item.total} mini-game đúng
            </Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  teacherHero: {
    minHeight: 220,
    padding: 20,
    borderRadius: radius.xl,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  parentHero: {
    minHeight: 220,
    padding: 20,
    borderRadius: radius.xl,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroShade: { position: "absolute", inset: 0, backgroundColor: "rgba(8,40,27,.48)" },
  heroContent: { width: "68%" },
  heroEyebrow: { ...type.eyebrow, color: colors.yellow },
  heroTitle: { ...type.h2, color: colors.white, marginTop: 6 },
  heroText: { color: "#E4EFE9", fontSize: 11, lineHeight: 17, marginTop: 5 },
  create: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    ...shadow.button,
  },
  createText: { color: colors.ink, fontWeight: "900" },
  stats: {
    flexDirection: "row",
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    paddingVertical: 15,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: colors.yellow, fontSize: 20, fontWeight: "900" },
  statLabel: {
    color: "#B8D4C6",
    fontSize: 7,
    textAlign: "center",
    marginTop: 3,
  },
  student: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14 },
  studentAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  studentInitial: { color: colors.ink, fontWeight: "900" },
  studentCopy: { flex: 1 },
  studentTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentName: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 9,
  },
  progress: { flex: 1 },
  question: { color: colors.muted, fontSize: 9, fontWeight: "800" },
  quizCard: { flexDirection: "row", alignItems: "center", gap: 11 },
  quizIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  quizIconText: { color: colors.white, fontSize: 20, fontWeight: "900" },
  quizCopy: { flex: 1 },
  quizTitle: { color: colors.ink, fontSize: 13, fontWeight: "900" },
  quizMeta: { color: colors.muted, fontSize: 9, marginTop: 3 },
  chevron: { color: colors.muted, fontSize: 25 },
  concept: { gap: 12 },
  conceptTop: { flexDirection: "row", alignItems: "center" },
  mastery: { color: colors.greenDark, fontSize: 18, fontWeight: "900" },
  result: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10 },
  resultImage: { width: 82, height: 68, borderRadius: radius.md },
  demoLock: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: colors.yellowSoft, borderColor: "#E8D976" },
  demoLockIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  demoLockIconText: { fontSize: 18 },
  unlock: { minHeight: 40, paddingHorizontal: 11, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  unlockText: { color: colors.yellow, fontSize: 9, fontWeight: "900" },
});
