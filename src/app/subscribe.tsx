import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { entitlementsApi, paymentsApi, plansApi, type AccountPlan, type Entitlement, type Payment, type Plan } from '@/api';
import { NoticeBanner } from '@/components/feedback';
import { Screen } from '@/components/screen';
import { Card, Pill } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radius, shadow, type } from '@/theme/tokens';

export default function SubscribeScreen() {
  const { refreshAccount, session } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<AccountPlan | null>(null);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentState, setPaymentState] = useState<'PENDING' | 'PAID' | 'FAILED' | null>(null);

  useEffect(() => {
    Promise.all([plansApi.list(), session ? entitlementsApi.list() : Promise.resolve([])]).then(([nextPlans, nextEntitlements]) => { setPlans(nextPlans); setEntitlements(nextEntitlements); }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được bảng giá.')).finally(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    if (!payment || paymentState === 'PAID' || paymentState === 'FAILED') return;
    let active = true;
    const check = async () => {
      try {
        const result = await paymentsApi.status(payment.orderCode);
        if (!active) return;
        setPaymentState(result.status);
        if (result.status === 'PAID') await refreshAccount();
      } catch { /* Keep polling: temporary PayOS/network failures preserve PENDING. */ }
    };
    void check();
    const timer = setInterval(() => void check(), 3000);
    return () => { active = false; clearInterval(timer); };
  }, [payment, paymentState, refreshAccount]);

  async function buy(plan: Plan) {
    if (!session) { router.push('/login'); return; }
    setBusy(plan.kind); setError(''); setSelectedPlan(plan);
    try { setPayment(await paymentsApi.create(plan.kind)); setPaymentState('PENDING'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể tạo đơn thanh toán.'); }
    finally { setBusy(null); }
  }

  return <Screen title="Gói đăng ký" subtitle="Chọn không gian phù hợp cho gia đình hoặc lớp học" action={<Pressable accessibilityLabel="Đóng" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>}>
    {error ? <NoticeBanner kind="error" message={error} onClose={() => setError('')} /> : null}
    {session ? <Card style={styles.currentPlan}>
      <View style={styles.currentTop}><View><Text style={styles.currentEyebrow}>GÓI ĐANG CÓ</Text><Text style={styles.currentTitle}>{session.account.plans.length ? session.account.plans.map(planName).join(' + ') : 'Chưa có gói học tập'}</Text></View><Pill color={session.account.plans.length ? colors.greenSoft : colors.yellowSoft}>{session.account.plans.length ? 'ĐANG HOẠT ĐỘNG' : 'TÀI KHOẢN KHÁCH'}</Pill></View>
      {entitlements.length ? <View style={styles.validities}>{entitlements.map((item) => <View key={item.id} style={styles.validity}><Text style={styles.validityName}>{planName(item.kind)}</Text><Text style={styles.validityDate}>Sử dụng đến {formatDate(item.expiresOn)}</Text></View>)}</View> : <Text style={styles.currentText}>Chọn một gói bên dưới để mở hồ sơ trẻ, tiến độ và nội dung học tập.</Text>}
    </Card> : null}
    {payment ? <Card style={styles.payment}>
      <Pill>ĐƠN #{payment.orderCode}</Pill><Text style={styles.paymentTitle}>Chuyển khoản để kích hoạt gói</Text>
      {selectedPlan ? <View style={styles.paymentPlan}><View><Text style={styles.paymentPlanLabel}>GÓI ĐÃ CHỌN</Text><Text style={styles.paymentPlanName}>{planName(selectedPlan.kind)}</Text></View><View style={styles.durationBadge}><Text style={styles.durationValue}>{selectedPlan.months} tháng</Text><Text style={styles.durationLabel}>thời hạn</Text></View></View> : null}
      {payment.qrCode ? <View style={styles.qr}><QRCode value={payment.qrCode} size={210} /></View> : null}
      {paymentState === 'PENDING' ? <Text style={styles.pending}>Đang chờ thanh toán… App tự kiểm tra mỗi 3 giây.</Text> : null}
      {paymentState === 'PAID' ? <NoticeBanner kind="success" message="Thanh toán thành công. Gói đã được kích hoạt." /> : null}
      {paymentState === 'FAILED' ? <NoticeBanner kind="error" message="Đơn đã hủy hoặc hết hạn. Bạn có thể tạo đơn mới." /> : null}
      <Info label="Ngân hàng" value={payment.bin} /><Info label="Số tài khoản" value={payment.accountNumber} /><Info label="Chủ tài khoản" value={payment.accountName} /><Info label="Số tiền" value={formatPrice(payment.amount)} /><Info label="Nội dung" value={payment.description} />
      <Text style={styles.expiry}>Đơn hết hạn lúc {new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(payment.expiresAt))}.</Text>
      {paymentState === 'PENDING' ? <Pressable onPress={async () => { try { await paymentsApi.cancel(payment.orderCode); setPaymentState('FAILED'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể hủy đơn.'); } }} style={styles.cancel}><Text style={styles.cancelText}>Hủy đơn thanh toán</Text></Pressable> : null}
      {paymentState === 'PAID' ? <Pressable onPress={() => router.replace('/(tabs)')} style={styles.buy}><Text style={styles.buyText}>Vào ứng dụng</Text></Pressable> : null}
    </Card> : null}
    {loading ? <ActivityIndicator color={colors.green} /> : plans.length ? plans.map((plan) => { const owned = session?.account.plans.includes(plan.kind); return <Card key={plan.kind} style={plan.kind === 'PARENT' ? styles.featured : undefined}>
      <View style={styles.planTop}><View style={styles.planIcon}><Text style={styles.planIconText}>{plan.kind === 'PARENT' ? 'PH' : 'GV'}</Text></View><View style={styles.flex}><Text style={styles.planName}>{planName(plan.kind)}</Text><View style={styles.limitBadge}><Text style={styles.limitLabel}>HẠN MỨC</Text><Text style={styles.limitValue}>{plan.kind === 'PARENT' ? '4 hồ sơ trẻ' : '40 học sinh'}</Text></View></View>{owned ? <Pill>ĐANG DÙNG</Pill> : plan.kind === 'PARENT' ? <Pill>PHỔ BIẾN</Pill> : null}</View>
      <Text style={styles.price}>{plan.price > 0 ? formatPrice(plan.price) : 'Liên hệ'}<Text style={styles.period}> / {plan.months} tháng</Text></Text>
      <View style={styles.durationRow}><Text style={styles.durationRowLabel}>Thời hạn mỗi lần {owned ? 'gia hạn' : 'đăng ký'}</Text><Text style={styles.durationRowValue}>{plan.months} tháng</Text></View>
      <View style={styles.benefits}><Text style={styles.benefit}>✓ Theo dõi hành trình và tiến bộ</Text><Text style={styles.benefit}>✓ Báo cáo, quiz và thành tựu đầy đủ</Text><Text style={styles.benefit}>✓ Mở quyền sử dụng game cho hồ sơ trẻ</Text></View>
      <Pressable disabled={busy !== null} onPress={() => buy(plan)} style={({ pressed }) => [styles.buy, pressed && styles.pressed, busy && styles.disabled]}>{busy === plan.kind ? <ActivityIndicator color={colors.yellow} /> : <View style={styles.buyCopy}><Text style={styles.buyText}>{session ? (owned ? `Gia hạn ${planName(plan.kind)}` : `Mua ${planName(plan.kind)}`) : 'Đăng nhập để mua'}</Text>{session ? <Text style={styles.buyDuration}>Thêm {plan.months} tháng sử dụng</Text> : null}</View>}</Pressable>
    </Card>}) : <Card><Text style={styles.emptyTitle}>Chưa có gói đang mở bán</Text><Text style={styles.note}>Bảng giá sẽ xuất hiện tại đây khi quản trị viên bật gói.</Text></Card>}
    {!session ? <Text style={styles.note}>Khách vẫn xem được toàn bộ trang giới thiệu và nội dung mẫu. Chỉ tài khoản có gói mới được chơi game.</Text> : null}
  </Screen>;
}

function Info({ label, value }: { label: string; value: string }) { return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text selectable style={styles.infoValue}>{value}</Text></View>; }
function formatPrice(value: number) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string) { const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN').format(date); }
function planName(kind: AccountPlan) { return kind === 'PARENT' ? 'FinTeen Gia đình' : 'FinTeen Lớp học'; }

const styles = StyleSheet.create({
  close:{width:44,height:44,borderRadius:14,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},closeText:{color:colors.ink,fontSize:27,lineHeight:29},flex:{flex:1},currentPlan:{backgroundColor:'#F2F8F4',borderColor:'#BBDAC7'},currentTop:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',gap:12},currentEyebrow:{...type.eyebrow,color:colors.greenDark},currentTitle:{color:colors.ink,fontFamily:'Fraunces_700Bold',fontSize:21,lineHeight:27,marginTop:5},currentText:{color:colors.muted,fontSize:11,lineHeight:17,marginTop:13},validities:{gap:8,marginTop:15},validity:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,padding:11,borderRadius:radius.md,backgroundColor:colors.white},validityName:{color:colors.ink,fontSize:11,fontWeight:'900'},validityDate:{color:colors.greenDark,fontSize:10,fontWeight:'800'},featured:{borderColor:'#D8C741',borderWidth:1.5},planTop:{flexDirection:'row',alignItems:'center',gap:11},planIcon:{width:48,height:48,borderRadius:16,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center'},planIconText:{color:colors.yellow,fontSize:12,fontWeight:'900'},planName:{...type.h2,color:colors.ink,fontSize:17},planAudience:{color:colors.muted,fontSize:10,marginTop:3},limitBadge:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:5,marginTop:6,paddingVertical:4,paddingHorizontal:7,borderRadius:8,backgroundColor:colors.greenSoft},limitLabel:{color:colors.green,fontSize:7,fontWeight:'900',letterSpacing:.7},limitValue:{color:colors.greenDark,fontSize:9,fontWeight:'900'},price:{color:colors.ink,fontSize:29,fontWeight:'900',marginTop:19},period:{color:colors.muted,fontSize:11,fontWeight:'700'},durationRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:11,paddingHorizontal:13,marginTop:12,borderRadius:radius.md,backgroundColor:colors.canvas},durationRowLabel:{color:colors.muted,fontSize:10,fontWeight:'700'},durationRowValue:{color:colors.greenDark,fontSize:12,fontWeight:'900'},benefits:{gap:9,marginVertical:18},benefit:{color:colors.inkSoft,fontSize:12,lineHeight:18},buy:{minHeight:60,borderRadius:radius.md,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center',marginTop:14,paddingVertical:9,paddingHorizontal:12,...shadow.button},buyCopy:{alignItems:'center',gap:3},buyText:{color:colors.yellow,fontSize:12,fontWeight:'900',textAlign:'center'},buyDuration:{color:'#C9DDD2',fontSize:9,fontWeight:'700'},pressed:{opacity:.75},disabled:{opacity:.55},note:{color:colors.muted,fontSize:10,lineHeight:16,textAlign:'center',paddingHorizontal:20},emptyTitle:{color:colors.ink,fontSize:15,fontWeight:'900',textAlign:'center',marginBottom:7},payment:{backgroundColor:colors.greenSoft,borderColor:'#A9D7BD'},paymentTitle:{color:colors.ink,fontSize:18,fontWeight:'900',marginVertical:15},paymentPlan:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,padding:13,borderRadius:radius.md,backgroundColor:colors.white,marginBottom:14},paymentPlanLabel:{...type.eyebrow,color:colors.green},paymentPlanName:{color:colors.ink,fontSize:14,fontWeight:'900',marginTop:4},durationBadge:{minWidth:68,paddingVertical:7,paddingHorizontal:10,borderRadius:12,backgroundColor:colors.yellowSoft,alignItems:'center'},durationValue:{color:colors.ink,fontSize:12,fontWeight:'900'},durationLabel:{color:colors.muted,fontSize:8,marginTop:1},qr:{alignSelf:'center',padding:14,borderRadius:radius.lg,backgroundColor:colors.white,marginBottom:13},pending:{color:colors.greenDark,fontSize:11,fontWeight:'800',textAlign:'center',marginBottom:10},info:{flexDirection:'row',justifyContent:'space-between',gap:15,paddingVertical:8,borderBottomWidth:1,borderBottomColor:'rgba(23,60,44,.12)'},infoLabel:{color:colors.muted,fontSize:11},infoValue:{flex:1,color:colors.ink,fontSize:12,fontWeight:'900',textAlign:'right'},expiry:{color:colors.greenDark,fontSize:10,lineHeight:15,marginTop:12},cancel:{height:46,borderRadius:radius.md,borderWidth:1,borderColor:'#E4A999',alignItems:'center',justifyContent:'center',marginTop:12},cancelText:{color:'#A74731',fontSize:11,fontWeight:'900'},
});
