import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { achievements, dailySummary, learners } from "@/data/dashboard";
import { colors, radius, type } from "@/theme/tokens";
export default function SummariesScreen() {
  return (
    <Screen
      title="Tổng kết"
      subtitle="Báo cáo theo chương và tổng kết hằng ngày"
    >
      <View style={styles.reportHero}><Image source={learners[0].chapters.at(-1)?.image} style={styles.reportImage} contentFit="cover" /><View style={styles.reportShade}/><View style={styles.reportCopy}><Text style={styles.reportKicker}>CÂU CHUYỆN MỚI NHẤT</Text><Text style={styles.reportTitle}>Căn nhà mơ ước</Text><Text style={styles.reportSubtitle}>Một chương về lựa chọn, trách nhiệm và mục tiêu gia đình.</Text></View></View>
      <Card style={styles.summary}>
        <View style={styles.summaryTop}>
          <View style={styles.ai}>
            <Text style={styles.aiText}>✦</Text>
          </View>
          <View>
            <Text style={styles.date}>{dailySummary.date}</Text>
            <Pill color={colors.purpleSoft} textColor={colors.purple}>
              {dailySummary.source}
            </Pill>
          </View>
        </View>
        <Text style={styles.summaryText}>{dailySummary.text}</Text>
        <View style={styles.suggestion}>
          <Text style={styles.suggestionLabel}>GỢI Ý ĐỒNG HÀNH</Text>
          <Text style={styles.suggestionText}>{dailySummary.suggestion}</Text>
        </View>
      </Card>
      <SectionTitle>Huy hiệu đã nhận</SectionTitle>
      <View style={styles.grid}>
        {achievements.map((item) => (
          <Card key={item.code} style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.badgeName}>{item.name}</Text>
            <Text style={styles.badgeDate}>{item.earnedAt}</Text>
          </Card>
        ))}
      </View>
      <SectionTitle>Chứng chỉ</SectionTitle>
      <Card style={styles.empty}>
        <Text style={styles.emptyIcon}>📜</Text>
        <View style={styles.emptyCopy}>
          <Text style={styles.emptyTitle}>Chưa có chứng chỉ</Text>
          <Text style={styles.emptyText}>
            Chứng chỉ sẽ xuất hiện khi trẻ đạt điều kiện của chương trình.
          </Text>
        </View>
      </Card>
      <View style={styles.privacy}>
        <Text style={styles.privacyTitle}>
          Quyền riêng tư trong tổng kết AI
        </Text>
        <Text style={styles.privacyText}>
          Hệ thống chỉ gửi số liệu và mã slot cho nhà cung cấp AI, không gửi tên
          trẻ hay nội dung lựa chọn thô. Nếu AI lỗi, báo cáo theo luật vẫn được
          tạo.
        </Text>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  reportHero:{height:210,borderRadius:radius.xl,overflow:"hidden"},
  reportImage:{width:"100%",height:"100%"},
  reportShade:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:"rgba(20,40,30,.42)"},
  reportCopy:{position:"absolute",left:16,right:16,bottom:15},
  reportKicker:{...type.eyebrow,color:colors.yellow},
  reportTitle:{color:colors.white,fontSize:20,fontWeight:"900",marginTop:5},
  reportSubtitle:{color:"#E5EFEA",fontSize:11,lineHeight:16,marginTop:3},
  summary: { backgroundColor: "#F4EFFF", borderColor: "#DCCFFC" },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  ai: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  aiText: { color: colors.white, fontSize: 24, fontWeight: "900" },
  date: { color: colors.ink, fontWeight: "900", marginBottom: 5 },
  summaryText: { ...type.body, color: colors.inkSoft, marginTop: 16 },
  suggestion: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 15,
  },
  suggestionLabel: { ...type.eyebrow, color: colors.green },
  suggestionText: {
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { width: "48%", padding: 14, alignItems: "center" },
  badgeIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.yellowSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: { fontSize: 28 },
  badgeName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 9,
  },
  badgeDate: { color: colors.muted, fontSize: 9, marginTop: 3 },
  empty: { flexDirection: "row", alignItems: "center", gap: 13 },
  emptyIcon: { fontSize: 31 },
  emptyCopy: { flex: 1 },
  emptyTitle: { color: colors.ink, fontWeight: "900" },
  emptyText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  privacy: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.greenSoft,
  },
  privacyTitle: { color: colors.greenDark, fontWeight: "900" },
  privacyText: {
    color: colors.inkSoft,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
});
