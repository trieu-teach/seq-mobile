import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { Brand } from "@/components/brand";
import { Screen } from "@/components/screen";
import { Card, Pill, Progress, SectionTitle } from "@/components/ui";
import { dailySummary, indicatorMeta, learners } from "@/data/dashboard";
import { useAuth } from "@/features/auth/auth-context";
import { colors, radius, spacing, type } from "@/theme/tokens";

export default function DashboardScreen() {
  const { session } = useAuth();
  const learner = learners[0];
  return (
    <Screen
      action={
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {session?.role === "TEACHER" ? "GV" : "PH"}
          </Text>
        </View>
      }
    >
      <Brand />
      <View>
        <Text style={styles.greeting}>
          Chào {session?.displayName?.split(" ").at(-1)} 👋
        </Text>
        <Text style={styles.sub}>
          {session?.role === "TEACHER"
            ? "Tổng quan lớp học hôm nay"
            : "Đây là cập nhật mới nhất của An"}
        </Text>
      </View>
      <View style={styles.storyHero}>
        <Image source={learner.chapters.at(-1)?.image} style={styles.storyImage} contentFit="cover" />
        <View style={styles.storyShade} />
        <View style={styles.storyCopy}><Pill color={colors.yellowSoft} textColor="#705800">VỪA HOÀN THÀNH</Pill><Text style={styles.storyTitle}>Chương 3 · Căn nhà mơ ước</Text><Text style={styles.storyText}>An đã khám phá cách phân biệt các khoản chi trong gia đình.</Text></View>
      </View>
      <Card style={styles.learner}>
        <View style={styles.learnerTop}>
          <View style={styles.childAvatar}>
            <Text style={styles.childAvatarText}>A</Text>
          </View>
          <View style={styles.learnerCopy}>
            <Text style={styles.learnerName}>{learner.name}</Text>
            <Text style={styles.meta}>
              Mã {learner.code} · {learner.lastActive}
            </Text>
          </View>
          <Pill>{learner.chaptersDone}/8 CHƯƠNG</Pill>
        </View>
        <Progress value={(learner.chaptersDone / 8) * 100} />
        <Text style={styles.progressHint}>
          Lượt chơi đầu tiên · Dữ liệu sau chương gần nhất
        </Text>
      </Card>
      <SectionTitle>Năm chỉ số hiện tại</SectionTitle>
      <View style={styles.indicators}>
        {Object.entries(learner.indicators).map(([key, value]) => {
          const meta = indicatorMeta[key as keyof typeof indicatorMeta];
          return (
            <Card key={key} style={styles.indicator}>
              <Text style={[styles.indicatorValue, { color: meta.color }]}>
                {value}
              </Text>
              <Text style={styles.indicatorLabel}>{meta.label}</Text>
            </Card>
          );
        })}
      </View>
      <SectionTitle>Tổng kết ngày {dailySummary.date}</SectionTitle>
      <Card style={styles.summary}>
        <View style={styles.summaryHead}>
          <Text style={styles.ai}>✦</Text>
          <Pill color={colors.purpleSoft} textColor={colors.purple}>
            {dailySummary.source} TỔNG KẾT
          </Pill>
        </View>
        <Text style={styles.summaryText}>{dailySummary.text}</Text>
        <View style={styles.suggestion}>
          <Text style={styles.suggestionTitle}>Gợi ý trò chuyện</Text>
          <Text style={styles.suggestionText}>{dailySummary.suggestion}</Text>
        </View>
      </Card>
      <Text style={styles.notice}>
        FinTeen chỉ cập nhật sau khi trẻ hoàn thành một chương, không theo dõi
        hoạt động theo thời gian thực.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: colors.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.purple, fontSize: 12, fontWeight: "900" },
  greeting: { ...type.h1, color: colors.ink },
  sub: { ...type.body, color: colors.muted, marginTop: 2 },
  storyHero:{height:210,borderRadius:radius.xl,overflow:"hidden"},
  storyImage:{width:"100%",height:"100%"},
  storyShade:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:"rgba(15,42,29,.38)"},
  storyCopy:{position:"absolute",left:16,right:16,bottom:15},
  storyTitle:{color:colors.white,fontSize:19,fontWeight:"900",marginTop:9},
  storyText:{color:"#E4F0EA",fontSize:11,lineHeight:16,marginTop:4,maxWidth:290},
  learner: { gap: 13 },
  learnerTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: colors.yellowSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarText: { color: "#7C6200", fontSize: 20, fontWeight: "900" },
  learnerCopy: { flex: 1 },
  learnerName: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 10, marginTop: 3 },
  progressHint: { color: colors.muted, fontSize: 10 },
  indicators: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  indicator: { width: "31%", padding: 13, alignItems: "center" },
  indicatorValue: { fontSize: 23, fontWeight: "900" },
  indicatorLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  summary: { backgroundColor: "#F4EFFF", borderColor: "#DCCFFC" },
  summaryHead: { flexDirection: "row", alignItems: "center", gap: 9 },
  ai: { fontSize: 24, color: colors.purple },
  summaryText: { ...type.body, color: colors.inkSoft, marginTop: 13 },
  suggestion: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 15,
  },
  suggestionTitle: { color: colors.greenDark, fontSize: 11, fontWeight: "900" },
  suggestionText: {
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  notice: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
