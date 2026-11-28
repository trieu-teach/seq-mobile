import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationsApi, type AppNotification } from '@/api';
import { NoticeBanner } from '@/components/feedback';
import { colors, radius, shadow, spacing, type } from '@/theme/tokens';

const PAGE_SIZE = 20;
const icons = {
  CHAPTER_COMPLETED: { ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' },
  QUIZ_SUBMITTED: { ios: 'checkmark.circle.fill', android: 'task_alt', web: 'task_alt' },
  REPORT_READY: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
} as const;

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
}

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busyAll, setBusyAll] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (nextPage = 0, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    setError('');
    try {
      const result = await notificationsApi.list(nextPage, PAGE_SIZE);
      setItems((current) => append ? [...current, ...result.items.filter((item) => !current.some((old) => old.id === item.id))] : result.items);
      setPage(result.page); setTotalPages(result.totalPages); setUnreadCount(result.unreadCount);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể tải thông báo.'); }
    finally { setLoading(false); setLoadingMore(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const open = useCallback(async (item: AppNotification) => {
    if (!item.read) {
      setItems((current) => current.map((row) => row.id === item.id ? { ...row, read: true } : row));
      setUnreadCount((count) => Math.max(0, count - 1));
      try { await notificationsApi.markRead(item.id); } catch { void load(); return; }
    }
    const action = item.action;
    if (!action?.resourceId) return;
    if (action.type === 'OPEN_LEARNER_REPORT') router.push({ pathname: '/learner/[id]', params: { id: action.resourceId } });
    else if (action.type === 'OPEN_QUIZ_RESULTS') router.push('/(tabs)/quiz');
    else if (action.type === 'OPEN_LEARNER_LIST') router.push('/(tabs)/journey');
    else if (action.type === 'OPEN_GROUP_REPORT') router.push('/(tabs)/rewards');
  }, [load]);

  async function markAllRead() {
    setBusyAll(true); setError('');
    try { await notificationsApi.markAllRead(); setItems((current) => current.map((item) => ({ ...item, read: true }))); setUnreadCount(0); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể đánh dấu đã đọc.'); }
    finally { setBusyAll(false); }
  }

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Quay lại" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.back}><SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={22} tintColor={colors.greenDark} type="monochrome" /></Pressable>
      <View style={styles.headerCopy}><Text style={styles.title}>Thông báo</Text><Text style={styles.subtitle}>{unreadCount ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã xem hết thông báo'}</Text></View>
      <Pressable disabled={!unreadCount || busyAll} onPress={() => void markAllRead()} style={[styles.readAll, (!unreadCount || busyAll) && styles.disabled]}>{busyAll ? <ActivityIndicator color={colors.greenDark} size="small" /> : <Text style={styles.readAllText}>Đọc tất cả</Text>}</Pressable>
    </View>
    {error ? <View style={styles.notice}><NoticeBanner kind="error" message={error} /></View> : null}
    <FlatList contentContainerStyle={[styles.content, !loading && !items.length && styles.emptyContent]} data={items} keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NotificationRow item={item} onPress={() => void open(item)} />}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.greenDark} onRefresh={() => { setRefreshing(true); void load(); }} />}
      onEndReached={() => { if (!loadingMore && page + 1 < totalPages) void load(page + 1, true); }} onEndReachedThreshold={0.35}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.greenDark} size="large" /> : <View style={styles.empty}><View style={styles.emptyIcon}><SymbolView name={{ ios: 'bell.slash.fill', android: 'notifications_off', web: 'notifications_off' }} size={32} tintColor={colors.greenDark} type="monochrome" /></View><Text style={styles.emptyTitle}>Chưa có thông báo</Text><Text style={styles.emptyText}>Các cập nhật về hành trình học tập sẽ xuất hiện tại đây.</Text></View>}
      ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.greenDark} /> : null} showsVerticalScrollIndicator={false} />
  </SafeAreaView>;
}

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.row, !item.read && styles.rowUnread, pressed && styles.pressed]}>
    <View style={[styles.rowIcon, !item.read && styles.rowIconUnread]}><SymbolView name={icons[item.type]} size={22} tintColor={colors.greenDark} type="monochrome" /></View>
    <View style={styles.rowCopy}><View style={styles.rowHead}><Text style={[styles.rowTitle, !item.read && styles.rowTitleUnread]}>{item.title}</Text>{!item.read ? <View style={styles.unreadDot} /> : null}</View><Text style={styles.message}>{item.message}</Text><Text style={styles.date}>{dateLabel(item.updatedAt)}</Text></View>
    {item.action ? <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.muted} type="monochrome" /> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.canvas},header:{minHeight:82,paddingHorizontal:spacing.lg,paddingVertical:12,flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1,borderBottomColor:colors.line},back:{width:44,height:44,borderRadius:14,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},headerCopy:{flex:1},title:{...type.h1,color:colors.ink},subtitle:{color:colors.muted,fontSize:10,marginTop:2},readAll:{minHeight:40,paddingHorizontal:10,borderRadius:12,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},readAllText:{color:colors.greenDark,fontSize:10,fontWeight:'900'},disabled:{opacity:.45},notice:{paddingHorizontal:spacing.lg,paddingTop:12},content:{padding:spacing.lg,paddingBottom:40,gap:11},emptyContent:{flexGrow:1,justifyContent:'center'},
  row:{minHeight:108,padding:14,borderRadius:radius.lg,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,flexDirection:'row',alignItems:'center',gap:11,...shadow.card},rowUnread:{borderColor:'#B9DFC9',backgroundColor:'#F7FCF8'},pressed:{opacity:.72,transform:[{scale:.99}]},rowIcon:{width:44,height:44,borderRadius:14,backgroundColor:colors.canvas,alignItems:'center',justifyContent:'center'},rowIconUnread:{backgroundColor:colors.greenSoft},rowCopy:{flex:1,gap:5},rowHead:{flexDirection:'row',alignItems:'flex-start',gap:7},rowTitle:{flex:1,color:colors.inkSoft,fontSize:13,lineHeight:18,fontWeight:'700'},rowTitleUnread:{color:colors.ink,fontWeight:'900'},unreadDot:{width:8,height:8,marginTop:5,borderRadius:4,backgroundColor:colors.coral},message:{color:colors.muted,fontSize:10,lineHeight:15},date:{color:colors.greenDark,fontSize:9,fontWeight:'700'},
  empty:{alignItems:'center',paddingHorizontal:30},emptyIcon:{width:68,height:68,borderRadius:22,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center',marginBottom:15},emptyTitle:{color:colors.ink,fontSize:18,fontWeight:'900'},emptyText:{color:colors.muted,fontSize:12,lineHeight:18,textAlign:'center',marginTop:6},
});
