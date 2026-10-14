import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, type } from '@/theme/tokens';

export function NoticeBanner({ kind, message, onClose }: { kind: 'success' | 'error'; message: string; onClose?: () => void }) {
  const success = kind === 'success';
  return <View accessibilityRole={success ? undefined : 'alert'} style={[styles.notice, success ? styles.noticeSuccess : styles.noticeError]}>
    <View style={[styles.noticeIcon, success ? styles.iconSuccess : styles.iconError]}><Text style={styles.iconText}>{success ? '✓' : '!'}</Text></View>
    <View style={styles.noticeCopy}><Text style={[styles.noticeTitle, success ? styles.successText : styles.errorText]}>{success ? 'Thành công' : 'Chưa thực hiện được'}</Text><Text style={styles.noticeMessage}>{message}</Text></View>
    {onClose ? <Pressable accessibilityLabel="Đóng thông báo" onPress={onClose} hitSlop={10}><Text style={styles.close}>×</Text></Pressable> : null}
  </View>;
}

export function ConfirmDialog({ visible, title, description, confirmLabel='Xác nhận', destructive=false, busy=false, onCancel, onConfirm }: { visible: boolean; title: string; description: string; confirmLabel?: string; destructive?: boolean; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}><Pressable style={StyleSheet.absoluteFill} onPress={busy ? undefined : onCancel}/><View style={styles.dialog}>
      <View style={[styles.dialogIcon, destructive ? styles.dialogDanger : styles.dialogSafe]}><Text style={styles.dialogIconText}>{destructive ? '!' : '✓'}</Text></View>
      <Text style={styles.dialogTitle}>{title}</Text><Text style={styles.dialogDescription}>{description}</Text>
      <View style={styles.actions}><Pressable disabled={busy} onPress={onCancel} style={[styles.button,styles.cancel]}><Text style={styles.cancelText}>Hủy</Text></Pressable><Pressable disabled={busy} onPress={onConfirm} style={[styles.button,destructive?styles.danger:styles.primary,busy&&styles.disabled]}><Text style={destructive?styles.dangerText:styles.primaryText}>{busy?'Đang xử lý…':confirmLabel}</Text></Pressable></View>
    </View></View>
  </Modal>;
}

const styles=StyleSheet.create({
  notice:{flexDirection:'row',alignItems:'flex-start',gap:11,padding:14,borderRadius:radius.lg,borderWidth:1,...shadow.card},noticeSuccess:{backgroundColor:'#F0FAF4',borderColor:'#BDE5CF'},noticeError:{backgroundColor:'#FFF4F0',borderColor:'#F0B9AA'},noticeIcon:{width:30,height:30,borderRadius:10,alignItems:'center',justifyContent:'center'},iconSuccess:{backgroundColor:colors.green},iconError:{backgroundColor:'#D96C50'},iconText:{color:colors.white,fontWeight:'900',fontSize:16},noticeCopy:{flex:1},noticeTitle:{fontSize:12,fontWeight:'900'},successText:{color:colors.greenDark},errorText:{color:'#B44F35'},noticeMessage:{color:colors.inkSoft,fontSize:11,lineHeight:17,marginTop:2},close:{color:colors.muted,fontSize:22,lineHeight:24},
  overlay:{flex:1,backgroundColor:'rgba(15,42,29,.48)',alignItems:'center',justifyContent:'center',padding:spacing.lg},dialog:{width:'100%',maxWidth:380,backgroundColor:colors.white,borderRadius:radius.xxl,padding:spacing.xl,alignItems:'center',...shadow.card},dialogIcon:{width:54,height:54,borderRadius:18,alignItems:'center',justifyContent:'center',marginBottom:14},dialogDanger:{backgroundColor:colors.coralSoft},dialogSafe:{backgroundColor:colors.greenSoft},dialogIconText:{color:colors.ink,fontWeight:'900',fontSize:24},dialogTitle:{...type.h2,color:colors.ink,textAlign:'center'},dialogDescription:{...type.body,color:colors.muted,textAlign:'center',marginTop:8},actions:{flexDirection:'row',gap:10,marginTop:22,width:'100%'},button:{flex:1,minHeight:48,borderRadius:radius.md,alignItems:'center',justifyContent:'center'},cancel:{backgroundColor:colors.canvas,borderWidth:1,borderColor:colors.line},primary:{backgroundColor:colors.yellow},danger:{backgroundColor:colors.coralSoft,borderWidth:1,borderColor:'#F0B9AA'},cancelText:{color:colors.inkSoft,fontWeight:'900'},primaryText:{color:colors.ink,fontWeight:'900'},dangerText:{color:'#B44F35',fontWeight:'900'},disabled:{opacity:.55},
});
