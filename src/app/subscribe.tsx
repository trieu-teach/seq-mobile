import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import QRCode from 'react-native-qrcode-svg';
import { groupsApi, paymentsApi, plansApi, type AccountPlan, type Payment, type Plan, type SlotQuota } from '@/api';
import { NoticeBanner } from '@/components/feedback';
import { Screen } from '@/components/screen';
import { Card, Pill } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radius, shadow, type } from '@/theme/tokens';

const paymentKey = (accountId: string) => `finteen.payment.active.${accountId}`;
async function readStoredPayment(accountId: string) { try { const raw=Platform.OS==='web'?globalThis.localStorage?.getItem(paymentKey(accountId)):await SecureStore.getItemAsync(paymentKey(accountId)); return raw?JSON.parse(raw) as {payment:Payment;kind:AccountPlan}:null; } catch { return null; } }
async function writeStoredPayment(accountId: string, value: {payment:Payment;kind:AccountPlan}|null) { try { if(Platform.OS==='web'){if(value)globalThis.localStorage?.setItem(paymentKey(accountId),JSON.stringify(value));else globalThis.localStorage?.removeItem(paymentKey(accountId));}else if(value)await SecureStore.setItemAsync(paymentKey(accountId),JSON.stringify(value));else await SecureStore.deleteItemAsync(paymentKey(accountId)); } catch { /* Payment remains available from the server history. */ } }

export default function SubscribeScreen() {
  const { refreshAccount, session } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [quotas, setQuotas] = useState<SlotQuota[]>([]);
  const [history, setHistory] = useState<Payment[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [packs, setPacks] = useState<Record<AccountPlan, string>>({ PARENT: '1', TEACHER: '1' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<AccountPlan | null>(null);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentState, setPaymentState] = useState<'PENDING' | 'PAID' | 'FAILED' | null>(null);

  const loadData = useCallback(async () => {
      try {
        const [nextPlans, quotaResponse, paymentResponse] = await Promise.all([
          plansApi.list(),
          session ? groupsApi.quota() : Promise.resolve([]),
          session ? paymentsApi.list(0, 10) : Promise.resolve([]),
        ]);
        const quotaRows = Array.isArray(quotaResponse) ? quotaResponse : quotaResponse.items ?? quotaResponse.quotas ?? [];
        const paymentRows = Array.isArray(paymentResponse) ? paymentResponse : paymentResponse.content ?? [];
        setPlans(nextPlans ?? []); setQuotas(quotaRows); setHistory(paymentRows); setHistoryPage(0); setHasMoreHistory(paymentRows.length === 10);
      } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được bảng giá.'); }
      finally { setLoading(false); }
  }, [session]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadData(); }, [loadData]);
  useEffect(() => { if(!session)return; let active=true; readStoredPayment(session.account.id).then((stored)=>{if(!active||!stored)return;setPayment(stored.payment);setSelectedPlan((current)=>current??plans.find((item)=>item.kind===stored.kind)??{kind:stored.kind,price:stored.payment.amount});setPaymentState('PENDING');});return()=>{active=false;}; }, [plans, session]);

  useEffect(() => {
    if (!payment || paymentState === 'PAID' || paymentState === 'FAILED') return;
    let active = true;
    const check = async () => {
      try {
        const result = await paymentsApi.status(payment.orderCode);
        if (!active) return;
        setPaymentState(result.status);
        if (result.status === 'PAID') { if(session)await writeStoredPayment(session.account.id,null); await refreshAccount(); await loadData(); }
        if (result.status === 'FAILED' && session) await writeStoredPayment(session.account.id,null);
      } catch { /* Keep polling: temporary PayOS/network failures preserve PENDING. */ }
    };
    void check();
    const timer = setInterval(() => void check(), 3000);
    return () => { active = false; clearInterval(timer); };
  }, [loadData, payment, paymentState, refreshAccount, session]);

  async function buy(plan: Plan, addon: boolean) {
    if (!session) { router.push('/login'); return; }
    setBusy(plan.kind); setError(''); setSelectedPlan(plan);
    try {
      const packCount = Math.max(1, Math.floor(Number(packs[plan.kind]) || 1));
      const created=addon?await paymentsApi.createAddon(plan.kind,packCount):await paymentsApi.create(plan.kind);setPayment(created);setPaymentState('PENDING');await writeStoredPayment(session.account.id,{payment:created,kind:plan.kind});
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể tạo đơn thanh toán.'); }
    finally { setBusy(null); }
  }

  return <Screen title="Gói đăng ký" subtitle="Chọn không gian phù hợp cho gia đình hoặc lớp học" action={<Pressable accessibilityLabel="Đóng" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>}>
    {error ? <NoticeBanner kind="error" message={error} onClose={() => setError('')} /> : null}
    {session ? <Card style={styles.currentPlan}>
      <View style={styles.currentTop}><View><Text style={styles.currentEyebrow}>GÓI ĐANG CÓ</Text><Text style={styles.currentTitle}>{session.account.plans.length ? session.account.plans.map(planName).join(' + ') : 'Chưa có gói học tập'}</Text></View><Pill color={session.account.plans.length ? colors.greenSoft : colors.yellowSoft}>{session.account.plans.length ? 'ĐANG HOẠT ĐỘNG' : 'CHƯA CÓ GÓI'}</Pill></View>
      {session.account.plans.length ? <Text style={styles.currentText}>Quyền sử dụng vĩnh viễn · có thể mua thêm lượt hồ sơ bất cứ lúc nào.</Text> : <Text style={styles.currentText}>Chọn một gói bên dưới để quản lý hồ sơ và theo dõi kết quả học tập.</Text>}
    </Card> : null}
    {quotas.length ? <Card><Text style={styles.sectionTitle}>Hạn mức hồ sơ</Text>{quotas.map((quota) => <View key={quota.context ?? quota.plan} style={styles.quotaRow}><Text style={styles.validityName}>{quota.context === 'CLASS' || quota.plan === 'TEACHER' ? 'Hồ sơ học sinh' : 'Hồ sơ của con'}</Text><Text style={styles.quotaValue}>Còn {quota.free ?? 0}/{quota.limit ?? 0} lượt</Text><Text style={styles.quotaMeta}>Có sẵn {quota.base ?? 0} · mua thêm {quota.extra ?? 0} · đã dùng {quota.used ?? 0} · đã xóa {quota.wiped ?? 0}</Text></View>)}</Card> : null}
    {payment ? <Card style={styles.payment}>
      <Pill>ĐƠN #{payment.orderCode}</Pill><Text style={styles.paymentTitle}>Chuyển khoản để kích hoạt gói</Text>
      {selectedPlan ? <View style={styles.paymentPlan}><View><Text style={styles.paymentPlanLabel}>GÓI ĐÃ CHỌN</Text><Text style={styles.paymentPlanName}>{planName(selectedPlan.kind)}</Text></View><View style={styles.durationBadge}><Text style={styles.durationValue}>Vĩnh viễn</Text><Text style={styles.durationLabel}>quyền sử dụng</Text></View></View> : null}
      {payment.qrCode ? <View style={styles.qr}><QRCode value={payment.qrCode} size={210} /></View> : null}
      {paymentState === 'PENDING' ? <Text style={styles.pending}>Đang chờ thanh toán… Ứng dụng tự kiểm tra mỗi 3 giây.</Text> : null}
      {paymentState === 'PAID' ? <NoticeBanner kind="success" message="Thanh toán thành công. Gói đã được kích hoạt." /> : null}
      {paymentState === 'FAILED' ? <NoticeBanner kind="error" message="Đơn đã hủy hoặc hết hạn. Bạn có thể tạo đơn mới." /> : null}
      <Info label="Ngân hàng" value={payment.bin} /><Info label="Số tài khoản" value={payment.accountNumber} /><Info label="Chủ tài khoản" value={payment.accountName} /><Info label="Số tiền" value={formatPrice(payment.amount)} /><Info label="Nội dung" value={payment.description} />
      <Text style={styles.expiry}>Đơn hết hạn lúc {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(payment.expiresAt))}.</Text>
      {paymentState === 'PENDING' ? <Pressable onPress={async () => { try { await paymentsApi.cancel(payment.orderCode,'Người dùng hủy trên mobile'); if(session)await writeStoredPayment(session.account.id,null); setPaymentState('FAILED'); await loadData(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể hủy đơn.'); } }} style={styles.cancel}><Text style={styles.cancelText}>Hủy đơn thanh toán</Text></Pressable> : null}
      {paymentState === 'PAID' ? <Pressable onPress={() => router.replace('/(tabs)')} style={styles.buy}><Text style={styles.buyText}>Vào ứng dụng</Text></Pressable> : null}
    </Card> : null}
    {loading ? <ActivityIndicator color={colors.green} /> : plans.length ? plans.map((plan) => { const owned = session?.account.plans.includes(plan.kind); const packCount=Math.max(1,Math.floor(Number(packs[plan.kind])||1)); return <Card key={plan.kind} style={plan.kind === 'PARENT' ? styles.featured : undefined}>
      <View style={styles.planTop}><View style={styles.planIcon}><Text style={styles.planIconText}>{plan.kind === 'PARENT' ? 'PH' : 'GV'}</Text></View><View style={styles.flex}><Text style={styles.planName}>{planName(plan.kind)}</Text><View style={styles.limitBadge}><Text style={styles.limitLabel}>HẠN MỨC</Text><Text style={styles.limitValue}>{plan.kind === 'PARENT' ? '4 hồ sơ trẻ' : '40 học sinh'}</Text></View></View>{owned ? <Pill>ĐANG DÙNG</Pill> : plan.kind === 'PARENT' ? <Pill>PHỔ BIẾN</Pill> : null}</View>
      <Text style={styles.price}>{owned ? formatPrice(Number(plan.addonPrice ?? 0) * packCount) : plan.price > 0 ? formatPrice(plan.price) : 'Liên hệ'}</Text>
      <View style={styles.durationRow}><Text style={styles.durationRowLabel}>{owned ? `${plan.addonSlots ?? 0} lượt hồ sơ mỗi gói bổ sung` : 'Mua một lần'}</Text><Text style={styles.durationRowValue}>{owned ? `+${Number(plan.addonSlots ?? 0) * packCount} lượt` : 'Dùng vĩnh viễn'}</Text></View>
      {owned && plan.addonPrice != null ? <View style={styles.packRow}><Text style={styles.durationRowLabel}>Số gói bổ sung</Text><TextInput keyboardType="number-pad" value={packs[plan.kind]} onChangeText={(value)=>setPacks((current)=>({...current,[plan.kind]:value.replace(/\D/g,'')}))} style={styles.packInput}/></View> : null}
      <View style={styles.benefits}><Text style={styles.benefit}>✓ Theo dõi hành trình và tiến bộ</Text><Text style={styles.benefit}>✓ Xem báo cáo và kết quả bài kiểm tra</Text><Text style={styles.benefit}>✓ Quản lý hồ sơ của con hoặc học sinh</Text></View>
      <Pressable disabled={busy !== null || Boolean(owned && plan.addonPrice == null)} onPress={() => buy(plan, Boolean(owned))} style={({ pressed }) => [styles.buy, pressed && styles.pressed, busy && styles.disabled]}>{busy === plan.kind ? <ActivityIndicator color={colors.yellow} /> : <View style={styles.buyCopy}><Text style={styles.buyText}>{session ? (owned ? plan.addonPrice == null ? 'Chưa mở bán lượt bổ sung' : `Mua ${packCount} gói bổ sung` : `Mua ${planName(plan.kind)}`) : 'Đăng nhập để mua'}</Text>{session ? <Text style={styles.buyDuration}>{owned ? `Nhận thêm ${Number(plan.addonSlots ?? 0) * packCount} lượt hồ sơ` : 'Quyền sử dụng vĩnh viễn'}</Text> : null}</View>}</Pressable>
    </Card>}) : <Card><Text style={styles.emptyTitle}>Chưa có gói đang mở bán</Text><Text style={styles.note}>Bảng giá sẽ xuất hiện tại đây khi quản trị viên bật gói.</Text></Card>}
    {session ? <Card><View style={styles.historyHead}><Text style={styles.sectionTitle}>Lịch sử thanh toán</Text><Pressable onPress={()=>void loadData()}><Text style={styles.reloadText}>Làm mới</Text></Pressable></View>{history.length ? history.map((item)=><View key={item.orderCode} style={styles.historyRow}><View style={styles.flex}><Text style={styles.validityName}>#{item.orderCode} · {planName(item.kind ?? 'PARENT')}</Text><Text style={styles.quotaMeta}>{item.purpose === 'ADDON' ? `Mua thêm ${Number(item.slots||item.addonSlots||0)>0?`${Number(item.slots||item.addonSlots)} lượt hồ sơ`:`${item.packs??1} gói bổ sung`}` : item.purpose==='RENEW'?'Giao dịch gia hạn trước đây':'Mua gói'} · {formatPaymentDate(item.paidAt ?? item.createdAt)}</Text></View><View><Text style={styles.historyAmount}>{formatPrice(item.amount)}</Text><Text style={styles.historyStatus}>{paymentStatus(item.status)}</Text></View></View>) : <Text style={styles.currentText}>Bạn chưa có giao dịch thanh toán nào.</Text>}{hasMoreHistory?<Pressable onPress={async()=>{const next=historyPage+1;const response=await paymentsApi.list(next,10);const rows=Array.isArray(response)?response:response.content??[];setHistory((current)=>[...current,...rows]);setHistoryPage(next);setHasMoreHistory(rows.length===10);}} style={styles.moreButton}><Text style={styles.moreText}>Xem thêm giao dịch</Text></Pressable>:null}</Card> : null}
    {!session ? <Text style={styles.note}>Bạn cần đăng nhập và có gói Phụ huynh hoặc Giáo viên để sử dụng ứng dụng.</Text> : null}
  </Screen>;
}

function Info({ label, value }: { label: string; value: string }) { return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text selectable style={styles.infoValue}>{value}</Text></View>; }
function formatPrice(value: number) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value); }
function planName(kind: AccountPlan) { return kind === 'PARENT' ? 'FinTeen Gia đình' : 'FinTeen Lớp học'; }
function formatPaymentDate(value?: string | null) { return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value)) : '—'; }
function paymentStatus(value?: Payment['status']) { return value === 'PAID' ? 'Đã thanh toán' : value === 'FAILED' ? 'Không thành công' : 'Đang chờ'; }

const styles = StyleSheet.create({
  close:{width:44,height:44,borderRadius:14,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},closeText:{color:colors.ink,fontSize:27,lineHeight:29},flex:{flex:1},currentPlan:{backgroundColor:'#F2F8F4',borderColor:'#BBDAC7'},currentTop:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',gap:12},currentEyebrow:{...type.eyebrow,color:colors.greenDark},currentTitle:{color:colors.ink,fontFamily:'Fraunces_700Bold',fontSize:21,lineHeight:27,marginTop:5},currentText:{color:colors.muted,fontSize:11,lineHeight:17,marginTop:13},validityName:{color:colors.ink,fontSize:11,fontWeight:'900'},featured:{borderColor:'#D8C741',borderWidth:1.5},planTop:{flexDirection:'row',alignItems:'center',gap:11},planIcon:{width:48,height:48,borderRadius:16,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center'},planIconText:{color:colors.yellow,fontSize:12,fontWeight:'900'},planName:{...type.h2,color:colors.ink,fontSize:17},limitBadge:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:5,marginTop:6,paddingVertical:4,paddingHorizontal:7,borderRadius:8,backgroundColor:colors.greenSoft},limitLabel:{color:colors.green,fontSize:7,fontWeight:'900',letterSpacing:.7},limitValue:{color:colors.greenDark,fontSize:9,fontWeight:'900'},price:{color:colors.ink,fontSize:29,fontWeight:'900',marginTop:19},durationRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:11,paddingHorizontal:13,marginTop:12,borderRadius:radius.md,backgroundColor:colors.canvas},durationRowLabel:{color:colors.muted,fontSize:10,fontWeight:'700'},durationRowValue:{color:colors.greenDark,fontSize:12,fontWeight:'900'},benefits:{gap:9,marginVertical:18},benefit:{color:colors.inkSoft,fontSize:12,lineHeight:18},buy:{minHeight:60,borderRadius:radius.md,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center',marginTop:14,paddingVertical:9,paddingHorizontal:12,...shadow.button},buyCopy:{alignItems:'center',gap:3},buyText:{color:colors.yellow,fontSize:12,fontWeight:'900',textAlign:'center'},buyDuration:{color:'#C9DDD2',fontSize:9,fontWeight:'700'},pressed:{opacity:.75},disabled:{opacity:.55},note:{color:colors.muted,fontSize:10,lineHeight:16,textAlign:'center',paddingHorizontal:20},emptyTitle:{color:colors.ink,fontSize:15,fontWeight:'900',textAlign:'center',marginBottom:7},payment:{backgroundColor:colors.greenSoft,borderColor:'#A9D7BD'},paymentTitle:{color:colors.ink,fontSize:18,fontWeight:'900',marginVertical:15},paymentPlan:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,padding:13,borderRadius:radius.md,backgroundColor:colors.white,marginBottom:14},paymentPlanLabel:{...type.eyebrow,color:colors.green},paymentPlanName:{color:colors.ink,fontSize:14,fontWeight:'900',marginTop:4},durationBadge:{minWidth:68,paddingVertical:7,paddingHorizontal:10,borderRadius:12,backgroundColor:colors.yellowSoft,alignItems:'center'},durationValue:{color:colors.ink,fontSize:12,fontWeight:'900'},durationLabel:{color:colors.muted,fontSize:8,marginTop:1},qr:{alignSelf:'center',padding:14,borderRadius:radius.lg,backgroundColor:colors.white,marginBottom:13},pending:{color:colors.greenDark,fontSize:11,fontWeight:'800',textAlign:'center',marginBottom:10},info:{flexDirection:'row',justifyContent:'space-between',gap:15,paddingVertical:8,borderBottomWidth:1,borderBottomColor:'rgba(23,60,44,.12)'},infoLabel:{color:colors.muted,fontSize:11},infoValue:{flex:1,color:colors.ink,fontSize:12,fontWeight:'900',textAlign:'right'},expiry:{color:colors.greenDark,fontSize:10,lineHeight:15,marginTop:12},cancel:{height:46,borderRadius:radius.md,borderWidth:1,borderColor:'#E4A999',alignItems:'center',justifyContent:'center',marginTop:12},cancelText:{color:'#A74731',fontSize:11,fontWeight:'900'},sectionTitle:{color:colors.ink,fontSize:16,fontWeight:'900',marginBottom:8},quotaRow:{paddingVertical:11,borderBottomWidth:1,borderBottomColor:colors.line},quotaValue:{color:colors.greenDark,fontSize:13,fontWeight:'900',marginTop:4},quotaMeta:{color:colors.muted,fontSize:9,lineHeight:14,marginTop:3},packRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:10},packInput:{width:72,minHeight:44,borderWidth:1,borderColor:colors.line,borderRadius:12,textAlign:'center',color:colors.ink,fontWeight:'900'},historyHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},reloadText:{color:colors.greenDark,fontSize:10,fontWeight:'900'},historyRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.line},historyAmount:{color:colors.ink,fontSize:11,fontWeight:'900',textAlign:'right'},historyStatus:{color:colors.greenDark,fontSize:9,fontWeight:'800',textAlign:'right',marginTop:3},moreButton:{minHeight:44,alignItems:'center',justifyContent:'center',marginTop:10},moreText:{color:colors.greenDark,fontSize:11,fontWeight:'900'},
});
