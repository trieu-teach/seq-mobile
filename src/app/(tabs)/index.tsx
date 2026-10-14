import { SymbolView } from "expo-symbols";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { NoticeBanner } from "@/components/feedback";
import { Screen } from "@/components/screen";
import { useWorkspaceData } from "@/features/account/use-workspace-data";
import { useAuth } from "@/features/auth/auth-context";
import { colors, shadow, type } from "@/theme/tokens";

const teacherArt = require("../../../assets/images/finteen/dashboard-teacher-bg-v2.png");
const parentArt = require("../../../assets/images/finteen/dashboard-parent-bg-v2.png");

function formatDate(value?: string) {
  if (!value) return "Chưa có";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("vi-VN").format(date);
}

export default function DashboardScreen() {
  const { session } = useAuth();
  const { capacity, entitlement, error, group, loading, reload, slots } = useWorkspaceData();
  const teacher = session?.role === "TEACHER";
  const active = slots.filter((slot) => slot.status === "ACTIVE");
  const limit = Number(group?.slotLimit) || (teacher ? 40 : 4);
  const available = capacity ?? Math.max(0, limit - active.length);
  const firstName = session?.displayName?.trim().split(/\s+/).at(-1) ?? "bạn";

  return (
    <Screen action={<Pressable accessibilityLabel="Mở tài khoản" onPress={() => router.push("/(tabs)/profile")} style={styles.avatar}><Text style={styles.avatarText}>{teacher ? "GV" : "PH"}</Text></Pressable>}>
      <View style={styles.greetingBlock}>
        <Text style={styles.kicker}>{teacher ? "KHÔNG GIAN GIÁO VIÊN" : "KHÔNG GIAN PHỤ HUYNH"}</Text>
        <Text style={styles.greeting}>Chào {firstName}</Text>
        <Text style={styles.sub}>{teacher ? "Cùng theo dõi lớp học hôm nay." : "Cùng đồng hành với hành trình của con."}</Text>
      </View>

      {loading ? <ActivityIndicator color={colors.green} /> : null}
      {error ? <NoticeBanner kind="error" message={error} /> : null}

      <LinearGradient colors={["#123E2B", "#236A4B", "#358564"]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.hero}>
        <Image accessibilityLabel={teacher ? "Minh họa lớp học" : "Minh họa gia đình"} contentFit="cover" contentPosition="right center" source={teacher ? teacherArt : parentArt} style={styles.heroArt} />
        <LinearGradient colors={["rgba(12,48,33,.94)", "rgba(12,48,33,.72)", "rgba(12,48,33,.12)"]} end={{ x: 1, y: 0 }} start={{ x: 0, y: 0 }} style={styles.artShade} />
        <View style={styles.heroTop}>
          <View style={styles.flex}>
            <Text style={styles.heroLabel}>{teacher ? "LỚP ĐANG QUẢN LÝ" : "GIA ĐÌNH CỦA BẠN"}</Text>
            <Text numberOfLines={1} style={styles.heroTitle}>{group?.name ?? (teacher ? "Chưa tạo lớp học" : "Chưa tạo nhóm gia đình")}</Text>
          </View>
          <View style={styles.status}><View style={styles.statusDot}/><Text style={styles.statusText}>{group ? "ĐANG MỞ" : "CHƯA TẠO"}</Text></View>
        </View>

        <View style={styles.capacityRow}>
          <View><Text style={styles.capacityValue}>{active.length}<Text style={styles.capacityLimit}>/{limit}</Text></Text><Text style={styles.capacityLabel}>{teacher ? "học sinh đang hoạt động" : "hồ sơ con đang hoạt động"}</Text></View>
        </View>

        <View style={styles.track}><View style={[styles.trackFill, { width: `${limit ? Math.min(100, active.length / limit * 100) : 0}%` }]} /></View>
        <Pressable onPress={() => router.push("/(tabs)/journey")} style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}>
          <Text style={styles.manageText}>{teacher ? "Quản lý học sinh" : "Quản lý hồ sơ con"}</Text>
          <SymbolView name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }} size={19} tintColor={colors.ink} type="monochrome" />
        </Pressable>
      </LinearGradient>

      {group ? <View style={styles.capacityStrip}><View style={styles.capacityStripIcon}><SymbolView name={{ios:available===0?'checkmark.circle.fill':'person.badge.plus',android:available===0?'check_circle':'person_add',web:available===0?'check_circle':'person_add'}} size={22} tintColor={available===0?'#806500':colors.greenDark} type="monochrome" /></View><View style={styles.flex}><Text style={styles.capacityStripLabel}>SỨC CHỨA CÒN LẠI</Text><Text style={styles.capacityStripTitle}>{available > 0 ? `Còn ${available} ${teacher ? 'chỗ học sinh' : 'hồ sơ con'}` : 'Đã sử dụng đủ sức chứa'}</Text></View><View style={[styles.capacityStripBadge,available===0&&styles.capacityStripBadgeFull]}><Text style={[styles.capacityStripValue,available===0&&styles.capacityStripValueFull]}>{available > 0 ? available : 'ĐÃ ĐẦY'}</Text></View></View> : null}

      <View style={styles.statsRow}>
        <StatCard icon={{ ios: "person.2.fill", android: "groups", web: "groups" }} label={teacher ? "Học sinh" : "Hồ sơ con"} value={String(active.length)} tone="yellow" />
        <StatCard icon={{ ios: "calendar", android: "calendar_month", web: "calendar_month" }} label="Hạn gói" value={formatDate(entitlement?.expiresOn)} />
      </View>

      <Pressable onPress={() => router.push('/subscribe' as never)} style={({ pressed }) => [styles.planLink, pressed && styles.pressed]}>
        <View style={styles.planLinkIcon}><SymbolView name={{ios:'wallet.bifold.fill',android:'workspace_premium',web:'workspace_premium'}} size={22} tintColor={colors.greenDark} type="monochrome" /></View>
        <View style={styles.flex}><Text style={styles.planLinkLabel}>GÓI HỌC TẬP</Text><Text style={styles.planLinkTitle}>{entitlement ? 'Xem quyền lợi và gia hạn gói' : 'Xem các gói đang mở bán'}</Text></View>
        <SymbolView name={{ios:'chevron.right',android:'chevron_right',web:'chevron_right'}} size={20} tintColor={colors.greenDark} type="monochrome" />
      </Pressable>

      <View style={styles.sectionHeader}>
        <View><Text style={styles.sectionEyebrow}>CẬP NHẬT GẦN ĐÂY</Text><Text style={styles.sectionTitle}>{teacher ? "Học sinh trong lớp" : "Hồ sơ trong gia đình"}</Text></View>
        <Pressable accessibilityLabel="Làm mới danh sách" onPress={reload} style={styles.refreshButton}><SymbolView name={{ ios: "arrow.clockwise", android: "refresh", web: "refresh" }} size={19} tintColor={colors.greenDark} type="monochrome" /></Pressable>
      </View>

      {active.length ? (
        <View style={styles.list}>
          {active.slice(0, 4).map((slot, index) => (
            <View key={slot.id} style={[styles.row, index < Math.min(active.length, 4) - 1 && styles.rowBorder]}>
              <View style={styles.childAvatar}><Text style={styles.childLetter}>{slot.displayName?.charAt(0).toUpperCase()}</Text></View>
              <View style={styles.flex}><Text numberOfLines={1} style={styles.name}>{slot.displayName}</Text><View style={styles.codeLine}><Text style={styles.codeLabel}>MÃ</Text><Text selectable style={styles.code}>{slot.code ?? "—"}</Text></View></View>
              <View style={styles.activeBadge}><View style={styles.activeDot}/><Text style={styles.activeText}>Hoạt động</Text></View>
            </View>
          ))}
        </View>
      ) : !loading ? (
        <View style={styles.empty}><View style={styles.emptyIcon}><SymbolView name={{ ios: "person.badge.plus", android: "person_add", web: "person_add" }} size={27} tintColor={colors.greenDark} type="monochrome" /></View><Text style={styles.emptyTitle}>{teacher ? "Chưa có học sinh" : "Chưa có hồ sơ con"}</Text><Text style={styles.emptyText}>Mở phần quản lý để tạo hồ sơ đầu tiên.</Text></View>
      ) : null}

      {active.length > 0 ? <Pressable onPress={() => router.push("/(tabs)/journey")} style={({ pressed }) => [styles.viewAll, pressed && styles.pressed]}><Text style={styles.viewAllText}>Xem tất cả {active.length} {teacher ? "học sinh" : "hồ sơ"}</Text><SymbolView name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }} size={18} tintColor={colors.greenDark} type="monochrome" /></Pressable> : null}
    </Screen>
  );
}

function StatCard({ icon, label, value, tone }: { icon: { ios: string; android: string; web: string }; label: string; value: string; tone?: "yellow" }) {
  return <View style={styles.statCard}><View style={[styles.statIcon, tone === "yellow" && styles.statIconYellow]}><SymbolView name={icon as never} size={21} tintColor={colors.greenDark} type="monochrome" /></View><Text style={styles.statLabel}>{label}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  flex:{flex:1},greetingBlock:{marginTop:-4},kicker:{...type.eyebrow,color:colors.greenDark},greeting:{color:colors.ink,fontSize:29,lineHeight:35,fontWeight:"900",letterSpacing:-.8,marginTop:4},sub:{color:colors.muted,fontSize:13,lineHeight:19,marginTop:3},
  avatar:{width:46,height:46,borderRadius:15,backgroundColor:colors.ink,alignItems:"center",justifyContent:"center",...shadow.button},avatarText:{color:colors.yellow,fontSize:11,fontWeight:"900"},
  hero:{borderRadius:28,padding:20,overflow:"hidden",backgroundColor:colors.ink,...shadow.large},heroArt:{position:"absolute",left:0,right:0,top:0,height:205,opacity:.95},artShade:{position:"absolute",left:0,right:0,top:0,height:205},heroTop:{flexDirection:"row",alignItems:"flex-start",gap:10,zIndex:2},heroLabel:{color:"#C7D9D0",fontSize:9,fontWeight:"900",letterSpacing:1},heroTitle:{color:colors.white,fontSize:21,fontWeight:"900",marginTop:5,maxWidth:205},status:{flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:9,paddingVertical:7,borderRadius:11,backgroundColor:"rgba(255,255,255,.16)"},statusDot:{width:7,height:7,borderRadius:4,backgroundColor:colors.yellow},statusText:{color:colors.white,fontSize:7,fontWeight:"900",letterSpacing:.6},
  capacityRow:{flexDirection:"row",alignItems:"flex-end",gap:10,marginTop:24,zIndex:2},capacityValue:{color:colors.white,fontSize:38,lineHeight:42,fontWeight:"900",letterSpacing:-1.2},capacityLimit:{color:"#9FC2B1",fontSize:20},capacityLabel:{color:"#AFCABE",fontSize:9,lineHeight:13,marginTop:2},
  track:{width:"100%",height:7,borderRadius:5,backgroundColor:"rgba(255,255,255,.13)",overflow:"hidden",marginTop:18,zIndex:2},trackFill:{height:"100%",borderRadius:5,backgroundColor:colors.yellow},manageButton:{height:52,borderRadius:17,backgroundColor:colors.yellow,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:9,marginTop:18,zIndex:2},manageText:{color:colors.ink,fontSize:13,fontWeight:"900"},pressed:{opacity:.75,transform:[{scale:.985}]},
  capacityStrip:{minHeight:72,padding:13,borderRadius:20,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,flexDirection:"row",alignItems:"center",gap:11,...shadow.card},capacityStripIcon:{width:45,height:45,borderRadius:15,backgroundColor:colors.greenSoft,alignItems:"center",justifyContent:"center"},capacityStripLabel:{...type.eyebrow,color:colors.greenDark},capacityStripTitle:{color:colors.ink,fontSize:12,fontWeight:"900",marginTop:4},capacityStripBadge:{minWidth:48,paddingHorizontal:11,paddingVertical:9,borderRadius:12,backgroundColor:colors.greenSoft,alignItems:"center"},capacityStripBadgeFull:{backgroundColor:colors.yellowSoft},capacityStripValue:{color:colors.greenDark,fontSize:16,fontWeight:"900"},capacityStripValueFull:{color:'#806500',fontSize:8},
  statsRow:{flexDirection:"row",gap:11},statCard:{flex:1,minHeight:125,padding:15,borderRadius:21,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,...shadow.card},statIcon:{width:40,height:40,borderRadius:13,backgroundColor:colors.greenSoft,alignItems:"center",justifyContent:"center"},statIconYellow:{backgroundColor:colors.yellowSoft},statLabel:{color:colors.muted,fontSize:10,fontWeight:"700",marginTop:12},statValue:{color:colors.ink,fontSize:18,fontWeight:"900",marginTop:3},
  sectionHeader:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},sectionEyebrow:{...type.eyebrow,color:colors.greenDark},sectionTitle:{color:colors.ink,fontSize:18,fontWeight:"900",marginTop:3},refreshButton:{width:44,height:44,borderRadius:14,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,alignItems:"center",justifyContent:"center"},
  list:{backgroundColor:colors.white,borderRadius:22,borderWidth:1,borderColor:colors.line,paddingHorizontal:14,...shadow.card},row:{minHeight:78,flexDirection:"row",alignItems:"center",gap:11},rowBorder:{borderBottomWidth:1,borderBottomColor:colors.line},childAvatar:{width:46,height:46,borderRadius:15,backgroundColor:colors.yellowSoft,alignItems:"center",justifyContent:"center"},childLetter:{color:colors.ink,fontSize:15,fontWeight:"900"},name:{color:colors.ink,fontSize:14,fontWeight:"900"},codeLine:{flexDirection:"row",alignItems:"center",gap:5,marginTop:4},codeLabel:{color:colors.greenDark,fontSize:8,fontWeight:"900"},code:{color:colors.inkSoft,fontSize:11,fontWeight:"900",letterSpacing:1},activeBadge:{flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:8,paddingVertical:7,borderRadius:11,backgroundColor:colors.greenSoft},activeDot:{width:6,height:6,borderRadius:3,backgroundColor:colors.green},activeText:{color:colors.greenDark,fontSize:8,fontWeight:"900"},
  empty:{padding:25,borderRadius:22,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,alignItems:"center",...shadow.card},emptyIcon:{width:54,height:54,borderRadius:18,backgroundColor:colors.greenSoft,alignItems:"center",justifyContent:"center"},emptyTitle:{color:colors.ink,fontSize:15,fontWeight:"900",marginTop:12},emptyText:{color:colors.muted,fontSize:11,marginTop:4},viewAll:{height:50,borderRadius:16,borderWidth:1,borderColor:colors.line,backgroundColor:colors.white,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:6},viewAllText:{color:colors.greenDark,fontSize:12,fontWeight:"900"},
  planLink:{minHeight:76,padding:13,borderRadius:20,backgroundColor:colors.yellowSoft,borderWidth:1,borderColor:'#E2D568',flexDirection:'row',alignItems:'center',gap:12},planLinkIcon:{width:46,height:46,borderRadius:15,backgroundColor:colors.white,alignItems:'center',justifyContent:'center'},planLinkLabel:{...type.eyebrow,color:colors.greenDark},planLinkTitle:{color:colors.ink,fontSize:13,fontWeight:'900',marginTop:4},
});
