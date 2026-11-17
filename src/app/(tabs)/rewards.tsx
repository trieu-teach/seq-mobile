import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NoticeBanner } from '@/components/feedback';
import { Screen } from '@/components/screen';
import { Card, Progress } from '@/components/ui';
import { useWorkspaceData } from '@/features/account/use-workspace-data';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radius, shadow, type } from '@/theme/tokens';

function dateLabel(value: string | null) {
  if (!value) return 'Chưa có hoạt động';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

export default function ReportsScreen() {
  const { session } = useAuth();
  const { error, group, loading, reload, report } = useWorkspaceData();
  const teacher = session?.role === 'TEACHER';
  const summary = report?.summary;
  const completion = summary?.totalChapters ? Math.min(100, summary.chaptersCompleted / summary.totalChapters * 100) : 0;
  return <Screen title="Tổng kết" subtitle={teacher ? 'Tiến độ và kết quả của lớp học' : 'Theo dõi hành trình học tập của con'} action={<Pressable accessibilityLabel="Làm mới báo cáo" onPress={reload} style={styles.refresh}><Text style={styles.refreshText}>↻</Text></Pressable>}>
    {loading ? <ActivityIndicator color={colors.greenDark} size="large" /> : null}
    {error ? <NoticeBanner kind="error" message={error} /> : null}
    {!loading && !report ? <Card><Text style={styles.empty}>{group ? 'Chưa có báo cáo cho nhóm này.' : `Hãy tạo ${teacher ? 'lớp học' : 'nhóm gia đình'} để bắt đầu theo dõi.`}</Text></Card> : null}
    {report && summary ? <>
      <View style={styles.hero}><Text style={styles.eyebrow}>{teacher ? 'BÁO CÁO LỚP HỌC' : 'BÁO CÁO GIA ĐÌNH'}</Text><Text style={styles.heroTitle}>{report.group.name}</Text><Text style={styles.heroMeta}>{summary.active}/{summary.learners} hồ sơ đang hoạt động · {summary.activeLast7Days} hoạt động trong 7 ngày</Text><View style={styles.progress}><Progress value={completion} color={colors.yellow} /></View><Text style={styles.progressText}>{summary.chaptersCompleted}/{summary.totalChapters} chương đã hoàn thành</Text></View>
      <View style={styles.stats}><Stat value={String(summary.learners)} label={teacher ? 'Học sinh' : 'Hồ sơ'} /><Stat value={`${summary.quizSubmitted}/${summary.quizAssigned}`} label="Quiz đã nộp" /><Stat value={summary.averageScore == null ? '—' : summary.averageScore.toFixed(1)} label="Điểm TB" /></View>
      <View><Text style={styles.sectionEyebrow}>CHI TIẾT NGƯỜI HỌC</Text><Text style={styles.sectionTitle}>Tiến độ gần nhất</Text></View>
      {report.rows.length ? report.rows.map((row) => <Pressable key={row.slotId} onPress={() => router.push({ pathname: '/learner/[id]', params: { id: row.slotId } })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.avatar}><Text style={styles.avatarText}>{(row.displayName ?? '?').charAt(0).toUpperCase()}</Text></View><View style={styles.rowCopy}><View style={styles.rowHead}><Text numberOfLines={1} style={styles.name}>{row.displayName ?? 'Đã xóa dữ liệu'}</Text><Text style={styles.chapter}>{row.completedChapters}/{summary.totalChapters}</Text></View><Progress value={summary.totalChapters ? Math.min(100, row.completedChapters / summary.totalChapters * 100) : 0} color={colors.green} /><Text style={styles.meta}>{dateLabel(row.lastActiveAt)} · Quiz {row.quizSubmitted}/{row.quizAssigned}</Text></View><Text style={styles.chevron}>›</Text></Pressable>) : <Card><Text style={styles.empty}>Nhóm chưa có người học để tổng hợp.</Text></Card>}
    </> : null}
  </Screen>;
}

function Stat({ value, label }: { value: string; label: string }) { return <Card style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></Card>; }

const styles = StyleSheet.create({
  refresh:{width:46,height:46,borderRadius:15,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},refreshText:{fontSize:24,color:colors.greenDark,fontWeight:'900'},hero:{padding:20,borderRadius:radius.xl,backgroundColor:colors.ink,...shadow.large},eyebrow:{...type.eyebrow,color:colors.yellow},heroTitle:{color:colors.white,fontSize:24,fontWeight:'900',marginTop:5},heroMeta:{color:'#BDD5C9',fontSize:11,lineHeight:17,marginTop:6},progress:{marginTop:20},progressText:{color:colors.white,fontSize:10,fontWeight:'800',marginTop:8},stats:{flexDirection:'row',gap:8},stat:{flex:1,padding:12,alignItems:'center'},statValue:{color:colors.greenDark,fontSize:18,fontWeight:'900'},statLabel:{color:colors.muted,fontSize:8,fontWeight:'700',marginTop:4,textAlign:'center'},sectionEyebrow:{...type.eyebrow,color:colors.greenDark},sectionTitle:{color:colors.ink,fontSize:19,fontWeight:'900',marginTop:3},row:{minHeight:88,padding:13,borderRadius:radius.lg,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,flexDirection:'row',alignItems:'center',gap:11,...shadow.card},pressed:{opacity:.72,transform:[{scale:.99}]},avatar:{width:46,height:46,borderRadius:15,backgroundColor:colors.yellowSoft,alignItems:'center',justifyContent:'center'},avatarText:{color:colors.ink,fontWeight:'900'},rowCopy:{flex:1,gap:6},rowHead:{flexDirection:'row',alignItems:'center',gap:8},name:{flex:1,color:colors.ink,fontSize:13,fontWeight:'900'},chapter:{color:colors.greenDark,fontSize:11,fontWeight:'900'},meta:{color:colors.muted,fontSize:9},chevron:{color:colors.greenDark,fontSize:27},empty:{color:colors.muted,textAlign:'center',lineHeight:20},
});
