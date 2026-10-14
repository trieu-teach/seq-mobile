import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { authApi } from "@/api";
import { AuthScreen } from "@/components/auth-screen";
import { NoticeBanner } from "@/components/feedback";
import { colors, radius, shadow } from "@/theme/tokens";

export default function ForgotPasswordScreen() {
  const [email,setEmail]=useState(""); const [otp,setOtp]=useState(""); const [password,setPassword]=useState(""); const [sent,setSent]=useState(false); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  async function requestCode(){if(!/^\S+@\S+\.\S+$/.test(email.trim())){setMessage("Hãy nhập địa chỉ email hợp lệ.");return;}setBusy(true);setMessage("");try{await authApi.forgotPassword(email);setSent(true);setMessage("Mã OTP đã được gửi tới email của bạn.");}catch(e){setMessage(e instanceof Error?e.message:"Không gửi được mã.");}finally{setBusy(false);}}
  async function reset(){if(!/^\d{6}$/.test(otp)||password.length<8){setMessage("OTP phải có 6 số và mật khẩu mới ít nhất 8 ký tự.");return;}setBusy(true);setMessage("");try{await authApi.resetPassword(email,otp,password);router.replace("/login");}catch(e){setMessage(e instanceof Error?e.message:"Không đặt lại được mật khẩu.");}finally{setBusy(false);}}
  return <AuthScreen background={require('../../assets/images/finteen/forgot-password-bg-v3.png')} accent="⌁" eyebrow="KHÔI PHỤC TÀI KHOẢN" title={sent?"Tạo mật khẩu mới":"Quên mật khẩu?"} subtitle={sent?`Mã xác minh đã được gửi tới ${email}.`:"Nhập email đã đăng ký, FinTeen sẽ gửi mã xác minh an toàn cho bạn."}>
    <Text style={styles.label}>Địa chỉ email</Text><TextInput autoCapitalize="none" autoCorrect={false} editable={!sent&&!busy} keyboardType="email-address" placeholder="ban@example.com" placeholderTextColor="#9AA69F" value={email} onChangeText={(v)=>{setEmail(v);setMessage("");}} style={styles.input}/>
    {sent?<><Text style={styles.label}>Mã OTP</Text><TextInput keyboardType="number-pad" maxLength={6} placeholder="000000" placeholderTextColor="#9AA69F" value={otp} onChangeText={(v)=>setOtp(v.replace(/\D/g,""))} style={[styles.input,styles.otp]}/><Text style={styles.label}>Mật khẩu mới</Text><TextInput secureTextEntry placeholder="Tối thiểu 8 ký tự" placeholderTextColor="#9AA69F" value={password} onChangeText={setPassword} style={styles.input}/></>:null}
    {message?<NoticeBanner kind={message.startsWith("Mã OTP")?"success":"error"} message={message} onClose={()=>setMessage("")}/>:null}
    <Pressable disabled={busy} onPress={sent?reset:requestCode} style={({pressed})=>[styles.button,(pressed||busy)&&styles.pressed]}>{busy?<ActivityIndicator color="#FFFDF8"/>:<><Text style={styles.buttonText}>{sent?"Lưu mật khẩu mới":"Gửi mã xác minh"}</Text><Text style={styles.arrow}>→</Text></>}</Pressable>
    {sent?<Pressable onPress={()=>{setSent(false);setOtp("");setMessage("");}} style={styles.secondary}><Text style={styles.secondaryText}>Đổi địa chỉ email</Text></Pressable>:null}
  </AuthScreen>;
}
const styles=StyleSheet.create({label:{color:"#31473C",fontSize:11,fontWeight:"800",marginBottom:7},input:{height:52,paddingHorizontal:14,borderWidth:1,borderColor:"#D6DDD6",borderRadius:radius.md,backgroundColor:"#FAFBF8",color:colors.ink,fontSize:14,marginBottom:13},otp:{fontSize:20,fontWeight:"900",letterSpacing:8,textAlign:"center"},button:{height:54,borderRadius:radius.md,backgroundColor:colors.ink,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,marginTop:5,...shadow.button},buttonText:{color:"#FFFDF8",fontWeight:"900"},arrow:{color:"#D9EE59",fontSize:20},secondary:{alignItems:"center",padding:15},secondaryText:{color:colors.greenDark,fontSize:11,fontWeight:"900"},pressed:{opacity:.65}});
