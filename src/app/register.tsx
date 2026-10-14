import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AuthScreen } from '@/components/auth-screen';
import { NoticeBanner } from '@/components/feedback';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radius } from '@/theme/tokens';

const background = require('../../assets/images/finteen/login-bg-v3.png');

export default function RegisterScreen() {
  const { register, resendVerification, verifyRegistration } = useAuth();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function submitDetails() {
    setError(''); setMessage('');
    if (!displayName.trim()) return setError('Hãy nhập họ và tên.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Email chưa đúng định dạng.');
    if (password.length < 8) return setError('Mật khẩu cần ít nhất 8 ký tự.');
    if (password !== confirmPassword) return setError('Mật khẩu nhập lại chưa khớp.');
    setBusy(true);
    const result = await register(email, password, displayName, phone);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    setStep('otp'); setCooldown(60); setMessage('Mã xác minh 6 số đã được gửi tới email của bạn.');
  }

  async function submitOtp() {
    if (!/^\d{6}$/.test(otp)) return setError('Mã xác minh phải gồm đúng 6 chữ số.');
    setBusy(true); setError('');
    const result = await verifyRegistration(email, otp);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    router.replace('/subscribe' as never);
  }

  async function resend() {
    if (cooldown) return;
    setBusy(true); setError(''); setMessage('');
    const result = await resendVerification(email);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    setCooldown(60); setMessage('Đã gửi mã mới. Mã cũ không còn hiệu lực.');
  }

  return <AuthScreen background={background} eyebrow={step === 'details' ? 'TẠO TÀI KHOẢN' : 'XÁC MINH EMAIL'} title={step === 'details' ? 'Bắt đầu cùng FinTeen.' : 'Nhập mã trong email.'} subtitle={step === 'details' ? 'Đăng ký miễn phí, sau đó chọn gói phù hợp với gia đình hoặc lớp học.' : `Mã gồm 6 chữ số, có hiệu lực 10 phút và đã gửi tới ${email}.`} accent={step === 'details' ? '+' : '6'}>
    {error ? <NoticeBanner kind="error" message={error} onClose={() => setError('')} /> : null}
    {message ? <NoticeBanner kind="success" message={message} onClose={() => setMessage('')} /> : null}
    {step === 'details' ? <>
      <Field label="Họ và tên" value={displayName} onChangeText={setDisplayName} placeholder="Nguyễn Văn A" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="ban@example.com" keyboardType="email-address" />
      <Field label="Số điện thoại (không bắt buộc)" value={phone} onChangeText={setPhone} placeholder="09xxxxxxxx" keyboardType="phone-pad" />
      <Field label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Tối thiểu 8 ký tự" secureTextEntry />
      <Field label="Nhập lại mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Nhập lại mật khẩu" secureTextEntry />
      <Submit busy={busy} label="Tạo tài khoản" onPress={submitDetails} />
      <Pressable onPress={() => router.replace('/login')} style={styles.link}><Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text></Pressable>
    </> : <>
      <Text style={styles.label}>Mã xác minh</Text><TextInput autoFocus editable={!busy} keyboardType="number-pad" maxLength={6} onChangeText={(value) => setOtp(value.replace(/\D/g, ''))} onSubmitEditing={submitOtp} placeholder="000000" placeholderTextColor="#9AA69F" style={[styles.input, styles.otp]} value={otp} />
      <Submit busy={busy} label="Xác minh và chọn gói" onPress={submitOtp} />
      <View style={styles.otpActions}><Pressable disabled={busy || cooldown > 0} onPress={resend}><Text style={[styles.linkText, cooldown > 0 && styles.muted]}>Gửi lại mã{cooldown ? ` (${cooldown}s)` : ''}</Text></Pressable><Pressable onPress={() => { setStep('details'); setOtp(''); setError(''); setMessage(''); }}><Text style={styles.linkText}>Sửa thông tin</Text></Pressable></View>
    </>}
  </AuthScreen>;
}

type FieldProps = { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'email-address' | 'phone-pad'; secureTextEntry?: boolean };
function Field({ label, ...props }: FieldProps) { return <View><Text style={styles.label}>{label}</Text><TextInput autoCapitalize={props.keyboardType === 'email-address' ? 'none' : 'words'} autoCorrect={false} editable {...props} placeholderTextColor="#9AA69F" style={styles.input} /></View>; }
function Submit({ busy, label, onPress }: { busy: boolean; label: string; onPress: () => void }) { return <Pressable disabled={busy} onPress={onPress} style={({ pressed }) => [styles.submit, (pressed || busy) && styles.pressed]}>{busy ? <ActivityIndicator color={colors.yellow} /> : <Text style={styles.submitText}>{label}</Text>}</Pressable>; }

const styles = StyleSheet.create({
  label:{color:colors.inkSoft,fontSize:11,fontWeight:'800',marginBottom:7,marginTop:3},input:{height:51,paddingHorizontal:14,borderWidth:1,borderColor:colors.line,borderRadius:radius.md,backgroundColor:'#FAFBF8',color:colors.ink,fontSize:14,marginBottom:11},otp:{height:64,fontSize:25,fontWeight:'900',letterSpacing:10,textAlign:'center'},submit:{height:53,borderRadius:radius.md,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center',marginTop:5},submitText:{color:colors.yellow,fontSize:14,fontWeight:'900'},link:{paddingVertical:16,alignItems:'center'},linkText:{color:colors.greenDark,fontSize:11,fontWeight:'900'},otpActions:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingTop:17},muted:{color:colors.muted},pressed:{opacity:.65},
});
