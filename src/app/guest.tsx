import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { Card, Pill, SectionTitle } from '@/components/ui';
import { chapterCatalog } from '@/data/dashboard';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radius, shadow, type } from '@/theme/tokens';

export default function GuestAccountScreen() {
  const { session, signOut } = useAuth();
  const firstName = session?.displayName?.trim().split(/\s+/).at(-1) ?? 'bạn';

  async function logout() {
    await signOut();
    router.replace('/login');
  }

  return <Screen title="Không gian khách" subtitle="Tài khoản đã kết nối · Chưa có gói học tập" action={<View style={styles.avatar}><Text style={styles.avatarText}>{session?.displayName?.trim().charAt(0).toUpperCase() || 'K'}</Text></View>}>
    <View style={styles.hero}>
      <Image source={require('../../assets/images/finteen/welcome-bg-v3.png')} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(9,49,33,.96)','rgba(9,49,33,.75)','rgba(9,49,33,.12)']} end={{x:1,y:0}} start={{x:0,y:0}} style={StyleSheet.absoluteFill} />
      <View style={styles.heroCopy}><Text style={styles.kicker}>TÀI KHOẢN ĐÃ KẾT NỐI</Text><Text style={styles.heroTitle}>Chào {firstName}, bắt đầu hành trình cùng FinTeen.</Text><Text style={styles.heroText}>Khám phá chương trình học, xem quyền lợi và chọn gói phù hợp với gia đình hoặc lớp học.</Text></View>
    </View>

    <Card style={styles.planCard}>
      <View style={styles.planIcon}><SymbolView name={{ios:'wallet.bifold.fill',android:'account_balance_wallet',web:'account_balance_wallet'}} size={24} tintColor={colors.greenDark} type="monochrome" /></View>
      <View style={styles.flex}><Text style={styles.planLabel}>GÓI ĐANG DÙNG</Text><Text style={styles.planTitle}>Chưa có gói học tập</Text><Text style={styles.planText}>Chọn gói để tạo hồ sơ trẻ, lưu tiến độ và mở đầy đủ nội dung.</Text></View>
      <Pressable onPress={() => router.push('/subscribe' as never)} style={styles.planButton}><Text style={styles.planButtonText}>Xem gói</Text></Pressable>
    </Card>

    <SectionTitle>Khám phá chương trình</SectionTitle>
    <View style={styles.chapterList}>{chapterCatalog.map((chapter) => <Card key={chapter.chapter} style={styles.chapter}>
      <Image source={chapter.image} contentFit="cover" style={styles.chapterImage} />
      <View style={styles.chapterCopy}><Pill color={colors.yellowSoft}>CHƯƠNG {chapter.chapter}</Pill><Text style={styles.chapterTitle}>{chapter.title}</Text><Text style={styles.chapterTheme}>{chapter.theme}</Text></View>
    </Card>)}</View>

    <Card style={styles.demoCard}>
      <View style={styles.demoIcon}><SymbolView name={{ios:'desktopcomputer',android:'computer',web:'computer'}} size={27} tintColor={colors.yellow} type="monochrome" /></View>
      <View style={styles.flex}><Text style={styles.demoEyebrow}>DEMO GAME</Text><Text style={styles.demoTitle}>Demo chỉ xem được trên bản Web</Text><Text style={styles.demoText}>Ứng dụng mobile giới thiệu nội dung chương. Hãy sử dụng FinTeen trên trình duyệt Web để trải nghiệm bản demo game.</Text></View>
    </Card>

    <Card style={styles.accountCard}><View style={styles.flex}><Text style={styles.planLabel}>TÀI KHOẢN</Text><Text style={styles.accountName}>{session?.displayName}</Text><Text style={styles.accountEmail}>{session?.email}</Text></View><Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>Đăng xuất</Text></Pressable></Card>
  </Screen>;
}

const styles = StyleSheet.create({
  flex:{flex:1},avatar:{width:46,height:46,borderRadius:15,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center',...shadow.button},avatarText:{color:colors.yellow,fontSize:15,fontWeight:'900'},hero:{height:235,borderRadius:radius.xl,overflow:'hidden',justifyContent:'flex-end',padding:20,...shadow.large},heroCopy:{width:'72%'},kicker:{...type.eyebrow,color:colors.yellow},heroTitle:{color:colors.white,fontFamily:'Fraunces_700Bold',fontSize:25,lineHeight:30,marginTop:7},heroText:{color:'#D4E4DC',fontSize:11,lineHeight:17,marginTop:7},planCard:{flexDirection:'row',alignItems:'center',gap:12,borderColor:'#D9CF70',backgroundColor:'#FFFBE5'},planIcon:{width:48,height:48,borderRadius:16,backgroundColor:colors.white,alignItems:'center',justifyContent:'center'},planLabel:{...type.eyebrow,color:colors.greenDark},planTitle:{color:colors.ink,fontSize:15,fontWeight:'900',marginTop:4},planText:{color:colors.muted,fontSize:9,lineHeight:14,marginTop:3},planButton:{minHeight:44,paddingHorizontal:13,borderRadius:radius.md,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center'},planButtonText:{color:colors.yellow,fontSize:10,fontWeight:'900'},chapterList:{gap:11},chapter:{padding:10,flexDirection:'row',alignItems:'center',gap:12},chapterImage:{width:92,height:82,borderRadius:radius.md},chapterCopy:{flex:1,alignItems:'flex-start'},chapterTitle:{color:colors.ink,fontSize:14,fontWeight:'900',marginTop:8},chapterTheme:{color:colors.muted,fontSize:9,lineHeight:14,marginTop:3},demoCard:{flexDirection:'row',alignItems:'center',gap:13,backgroundColor:colors.ink,borderColor:colors.ink},demoIcon:{width:54,height:54,borderRadius:18,backgroundColor:'rgba(255,255,255,.1)',alignItems:'center',justifyContent:'center'},demoEyebrow:{...type.eyebrow,color:colors.yellow},demoTitle:{color:colors.white,fontSize:15,fontWeight:'900',marginTop:4},demoText:{color:'#BED2C8',fontSize:10,lineHeight:16,marginTop:4},accountCard:{flexDirection:'row',alignItems:'center',gap:12},accountName:{color:colors.ink,fontSize:14,fontWeight:'900',marginTop:4},accountEmail:{color:colors.muted,fontSize:10,marginTop:3},logout:{minHeight:44,paddingHorizontal:13,borderRadius:radius.md,borderWidth:1,borderColor:'#E4A999',alignItems:'center',justifyContent:'center'},logoutText:{color:'#A74731',fontSize:10,fontWeight:'900'},
});
