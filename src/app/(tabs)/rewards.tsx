import { router } from 'expo-router';
import { useState } from 'react';
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
  const { error, group, loading, reload, reports, reportWarning } = useWorkspaceData();
  const [groupId, setGroupId] = useState('');
  const [status, setStatus] = useState('');
  const teacher = session?.role === 'TEACHER';
  const report = reports.find((item) => item.group.id === groupId) ?? reports[0] ?? null;
  const rows = report?.rows.filter((row) => !status || row.status === status) ?? [];
  const summary = report?.summary;
  const completion = summary?.totalChapters ? Math.min(100, summary.chaptersCompleted / summary.totalChapters * 100) : 0;
  return <Screen title="Báo cáo học tập" subtitle={teacher ? 'Theo dõi tiến độ và kết quả của học sinh' : 'Theo dõi tiến độ và kết quả học tập của con'} action={<Pressable accessibilityLabel="Làm mới báo cáo" onPress={reload} style={styles.refresh}><Text style={styles.refreshText}>↻</Text></Pressable>}>
    {loading ? <ActivityIndicator color={colors.greenDark} size="large" /> : null}
    {error ? <NoticeBanner kind="error" message={error} /> : null}
    {reportWarning ? <NoticeBanner kind="error" message={reportWarning} /> : null}
    {!loading && !report ? <Card><Text style={styles.empty}>{group ? 'Chưa có báo cáo cho nhóm này.' : `Hãy tạo ${teacher ? 'lớp học' : 'nhóm gia đình'} để bắt đầu theo dõi.`}</Text></Card> : null}
    {report && summary ? <>
      {reports.length > 1 ? <View style={styles.groupTabs}>{reports.map((item)=><Pressable key={item.group.id} onPress={()=>setGroupId(item.group.id)} style={[styles.groupTab,report.group.id===item.group.id&&styles.groupTabActive]}><Text style={[styles.groupTabText,report.group.id===item.group.id&&styles.groupTabTextActive]}>{item.group.name}{item.group.closedAt?' · Đã đóng':''}</Text></Pressable>)}</View> : null}
      <View style={styles.hero}><Text style={styles.eyebrow}>{teacher ? 'BÁO CÁO LỚP HỌC' : 'BÁO CÁO CỦA CON'}</Text><Text style={styles.heroTitle}>{report.group.name}</Text><Text style={styles.heroMeta}>{summary.active}/{summary.learners} {teacher ? 'học sinh' : 'hồ sơ của con'} đang hoạt động · {summary.activeLast7Days} có hoạt động trong 7 ngày qua</Text><View style={styles.progress}><Progress value={completion} color={colors.yellow} /></View><Text style={styles.progressText}>{summary.chaptersCompleted}/{summary.totalChapters} chương đã hoàn thành</Text></View>
      <View style={styles.stats}><Stat value={String(summary.learners)} label={teacher ? 'Học sinh' : 'Con'} /><Stat value={`${summary.quizSubmitted}/${summary.quizAssigned}`} label="Bài đã nộp" /><Stat value={summary.averageScore == null ? '—' : summary.averageScore.toFixed(1)} label="Điểm trung bình" /></View>
      <View><Text style={styles.sectionEyebrow}>{teacher ? 'CHI TIẾT HỌC SINH' : 'CHI TIẾT CỦA CON'}</Text><Text style={styles.sectionTitle}>Tiến độ gần nhất</Text></View>
      <View style={styles.filters}>{['','ACTIVE','ARCHIVED','WIPED'].map((value)=><Pressable key={value||'ALL'} onPress={()=>setStatus(value)} style={[styles.filter,status===value&&styles.filterActive]}><Text style={[styles.filterText,status===value&&styles.filterTextActive]}>{value===''?'Tất cả':value==='ACTIVE'?'Hoạt động':value==='ARCHIVED'?'Ngừng':'Đã xóa'}</Text></Pressable>)}</View>
      {rows.length ? rows.map((row) => <Pressable key={row.slotId} onPress={() => router.push({ pathname: '/learner/[id]', params: { id: row.slotId } })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.avatar}><Text style={styles.avatarText}>{(row.displayName ?? '?').charAt(0).toUpperCase()}</Text></View><View style={styles.rowCopy}><View style={styles.rowHead}><Text numberOfLines={1} style={styles.name}>{row.displayName ?? 'Đã xóa dữ liệu'}</Text><Text style={styles.chapter}>{row.completedChapters}/{summary.totalChapters}</Text></View><Progress value={summary.totalChapters ? Math.min(100, row.completedChapters / summary.totalChapters * 100) : 0} color={colors.green} /><Text style={styles.meta}>{dateLabel(row.lastActiveAt)} · Bài kiểm tra {row.quizSubmitted}/{row.quizAssigned}</Text></View><Text style={styles.chevron}>›</Text></Pressable>) : <Card><Text style={styles.empty}>Không có {teacher ? 'học sinh' : 'hồ sơ của con'} phù hợp với bộ lọc.</Text></Card>}
    </> : null}
  </Screen>;
}

function Stat({ value, label }: { value: string; label: string }) { return <Card style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></Card>; }

const styles = StyleSheet.create({
  refresh:{width:46,height:46,borderRadius:15,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},refreshText:{fontSize:24,color:colors.greenDark,fontWeight:'900'},groupTabs:{gap:8},groupTab:{minHeight:44,paddingHorizontal:13,borderRadius:14,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},groupTabActive:{backgroundColor:colors.ink,borderColor:colors.ink},groupTabText:{color:colors.muted,fontSize:10,fontWeight:'800'},groupTabTextActive:{color:colors.yellow},filters:{flexDirection:'row',gap:6},filter:{flex:1,minHeight:40,paddingHorizontal:4,borderRadius:12,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},filterActive:{backgroundColor:colors.greenSoft,borderColor:colors.green},filterText:{color:colors.muted,fontSize:8,fontWeight:'800'},filterTextActive:{color:colors.greenDark},hero:{padding:20,borderRadius:radius.xl,backgroundColor:colors.ink,...shadow.large},eyebrow:{...type.eyebrow,color:colors.yellow},heroTitle:{color:colors.white,fontSize:24,fontWeight:'900',marginTop:5},heroMeta:{color:'#BDD5C9',fontSize:11,lineHeight:17,marginTop:6},progress:{marginTop:20},progressText:{color:colors.white,fontSize:10,fontWeight:'800',marginTop:8},stats:{flexDirection:'row',gap:8},stat:{flex:1,padding:12,alignItems:'center'},statValue:{color:colors.greenDark,fontSize:18,fontWeight:'900'},statLabel:{color:colors.muted,fontSize:8,fontWeight:'700',marginTop:4,textAlign:'center'},sectionEyebrow:{...type.eyebrow,color:colors.greenDark},sectionTitle:{color:colors.ink,fontSize:19,fontWeight:'900',marginTop:3},row:{minHeight:88,padding:13,borderRadius:radius.lg,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,flexDirection:'row',alignItems:'center',gap:11,...shadow.card},pressed:{opacity:.72,transform:[{scale:.99}]},avatar:{width:46,height:46,borderRadius:15,backgroundColor:colors.yellowSoft,alignItems:'center',justifyContent:'center'},avatarText:{color:colors.ink,fontWeight:'900'},rowCopy:{flex:1,gap:6},rowHead:{flexDirection:'row',alignItems:'center',gap:8},name:{flex:1,color:colors.ink,fontSize:13,fontWeight:'900'},chapter:{color:colors.greenDark,fontSize:11,fontWeight:'900'},meta:{color:colors.muted,fontSize:9},chevron:{color:colors.greenDark,fontSize:27},empty:{color:colors.muted,textAlign:'center',lineHeight:20},
});
