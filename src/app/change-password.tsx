import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { AuthScreen } from "@/components/auth-screen";
import { NoticeBanner } from "@/components/feedback";
import { useAuth } from "@/features/auth/auth-context";
import { colors, radius, shadow } from "@/theme/tokens";

export default function ChangePasswordScreen(){
  const{changePassword}=useAuth();const[oldPassword,setOldPassword]=useState("");const[newPassword,setNewPassword]=useState("");const[confirm,setConfirm]=useState("");const[busy,setBusy]=useState(false);const[message,setMessage]=useState("");
  async function submit(){if(!oldPassword){setMessage("Hãy nhập mật khẩu hiện tại.");return;}if(newPassword.length<8||newPassword!==confirm){setMessage("Mật khẩu mới phải có ít nhất 8 ký tự và phần xác nhận phải trùng khớp.");return;}setBusy(true);setMessage("");const result=await changePassword(oldPassword,newPassword);setBusy(false);if(result.ok)router.back();else setMessage(result.message);}
  return <AuthScreen background={require('../../assets/images/finteen/change-password-bg-v3.png')} accent="◆" eyebrow="BẢO MẬT TÀI KHOẢN" title="Đổi mật khẩu" subtitle="Dùng mật khẩu mạnh và riêng biệt để giữ an toàn cho dữ liệu gia đình và lớp học.">
    <PasswordField label="Mật khẩu hiện tại" value={oldPassword} onChange={setOldPassword}/><PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} hint="Tối thiểu 8 ký tự"/><PasswordField label="Xác nhận mật khẩu mới" value={confirm} onChange={setConfirm}/>
    {message?<NoticeBanner kind="error" message={message} onClose={()=>setMessage("")}/>:null}
    <Pressable disabled={busy} onPress={submit} style={({pressed})=>[styles.button,(pressed||busy)&&styles.pressed]}>{busy?<ActivityIndicator color="#FFFDF8"/>:<><Text style={styles.buttonText}>Lưu mật khẩu mới</Text><Text style={styles.arrow}>→</Text></>}</Pressable>
  </AuthScreen>;
}
function PasswordField({label,value,onChange,hint}:{label:string;value:string;onChange:(value:string)=>void;hint?:string}){return <><Text style={styles.label}>{label}</Text><TextInput autoCapitalize="none" secureTextEntry placeholder={hint??"Nhập mật khẩu"} placeholderTextColor="#9AA69F" value={value} onChangeText={onChange} style={styles.input}/></>}
const styles=StyleSheet.create({label:{color:"#31473C",fontSize:11,fontWeight:"800",marginBottom:7},input:{height:52,paddingHorizontal:14,borderWidth:1,borderColor:"#D6DDD6",borderRadius:radius.md,backgroundColor:"#FAFBF8",color:colors.ink,fontSize:14,marginBottom:13},button:{height:54,borderRadius:radius.md,backgroundColor:colors.ink,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,marginTop:5,...shadow.button},buttonText:{color:"#FFFDF8",fontWeight:"900"},arrow:{color:"#D9EE59",fontSize:20},pressed:{opacity:.65}});
