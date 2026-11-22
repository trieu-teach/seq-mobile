import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { quizzesApi, type Question, type QuestionInput } from '@/api';
import { ConfirmDialog, Toast } from '@/components/feedback';
import { colors, radius, shadow, spacing, type } from '@/theme/tokens';

type Bank = 'shared' | 'mine';
type EditorValue = QuestionInput & { id?: string };
const blank = (): EditorValue => ({ stem: '', options: ['', ''], correctIndex: 0 });
const rowsOf = (value: Question[] | { items?: Question[] }) => Array.isArray(value) ? value : value.items ?? [];

export function QuestionBank() {
  const [bank, setBank] = useState<Bank>('mine');
  const [rows, setRows] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editor, setEditor] = useState<EditorValue | null>(null);
  const [deleting, setDeleting] = useState<Question | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setRows(rowsOf(bank === 'shared' ? await quizzesApi.questions() : await quizzesApi.myQuestions())); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được kho câu hỏi.'); }
    finally { setLoading(false); }
  }, [bank]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function copy(question: Question) {
    setBusy(true); setError('');
    try { await quizzesApi.copyQuestion(question.id); setMessage('Đã sao chép vào Câu của tôi.'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không sao chép được câu hỏi.'); }
    finally { setBusy(false); }
  }
  async function save(value: EditorValue) {
    setBusy(true); setError('');
    try {
      const payload = { stem: value.stem.trim(), options: value.options.map((item) => item.trim()), correctIndex: value.correctIndex };
      if (value.id) await quizzesApi.updateMyQuestion(value.id, payload); else await quizzesApi.createMyQuestions([payload]);
      setEditor(null); setMessage('Đã lưu câu hỏi vào kho riêng.'); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được câu hỏi.'); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true); setError('');
    try { await quizzesApi.deleteMyQuestion(deleting.id); setDeleting(null); setMessage('Đã xóa câu hỏi.'); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được câu hỏi.'); setDeleting(null); }
    finally { setBusy(false); }
  }

  return <View style={styles.screen}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><View style={styles.flex}><Text style={styles.eyebrow}>NGÂN HÀNG CÂU HỎI</Text><Text style={styles.title}>Quản lý câu hỏi kiểm tra</Text></View><Pressable onPress={() => void load()} style={styles.refresh}><Text style={styles.refreshText}>↻</Text></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {error ? <Toast kind="error" message={error} onClose={() => setError('')}/> : null}{message ? <Toast kind="success" message={message} onClose={() => setMessage('')}/> : null}
      <View style={styles.tabs}><Pressable onPress={() => setBank('shared')} style={[styles.tab,bank==='shared'&&styles.tabActive]}><Text style={[styles.tabText,bank==='shared'&&styles.tabTextActive]}>Kho dùng chung</Text></Pressable><Pressable onPress={() => setBank('mine')} style={[styles.tab,bank==='mine'&&styles.tabActive]}><Text style={[styles.tabText,bank==='mine'&&styles.tabTextActive]}>Câu của tôi</Text></Pressable></View>
      <View style={styles.intro}><View style={styles.flex}><Text style={styles.introTitle}>{bank==='shared'?'Kho câu hỏi chung':'Kho câu hỏi riêng'}</Text><Text style={styles.introText}>{bank==='shared'?'Sao chép một câu vào kho riêng trước khi chỉnh sửa.':'Thêm, sửa và xóa câu hỏi riêng mà không ảnh hưởng kho chung.'}</Text></View>{bank==='mine'?<Pressable onPress={()=>setEditor(blank())} style={styles.add}><Text style={styles.addText}>＋ Thêm câu</Text></Pressable>:null}</View>
      {loading?<ActivityIndicator color={colors.greenDark} size="large"/>:rows.length?rows.map((question,index)=><View key={question.id} style={styles.card}><Text style={styles.number}>CÂU {index+1}</Text><Text style={styles.stem}>{question.stem}</Text><View style={styles.options}>{question.options.map((option,i)=><View key={i} style={[styles.option,i===question.correctIndex&&styles.correct]}><Text style={[styles.optionLabel,i===question.correctIndex&&styles.correctText]}>{String.fromCharCode(65+i)}</Text><Text style={[styles.optionText,i===question.correctIndex&&styles.correctText]}>{option}</Text></View>)}</View><View style={styles.actions}>{bank==='shared'?<Pressable disabled={busy} onPress={()=>void copy(question)} style={styles.action}><Text style={styles.actionText}>Sao chép để sửa</Text></Pressable>:<><Pressable onPress={()=>setEditor({id:question.id,stem:question.stem,options:[...question.options],correctIndex:question.correctIndex})} style={styles.action}><Text style={styles.actionText}>Sửa</Text></Pressable><Pressable onPress={()=>setDeleting(question)} style={[styles.action,styles.danger]}><Text style={styles.dangerText}>Xóa</Text></Pressable></>}</View></View>):<Text style={styles.empty}>Chưa có câu hỏi trong kho này.</Text>}
    </ScrollView>
    {editor ? <QuestionEditor key={editor.id ?? 'new'} value={editor} busy={busy} onClose={()=>setEditor(null)} onSave={save}/> : null}
    <ConfirmDialog visible={Boolean(deleting)} title="Xóa câu hỏi?" description="Câu hỏi sẽ bị xóa khỏi kho riêng của bạn." destructive busy={busy} onCancel={()=>setDeleting(null)} onConfirm={()=>void remove()}/>
  </View>;
}

function QuestionEditor({value,busy,onClose,onSave}:{value:EditorValue;busy:boolean;onClose:()=>void;onSave:(value:EditorValue)=>Promise<void>}){
  const [question,setQuestion]=useState<EditorValue>(value); const [validation,setValidation]=useState('');
  function option(index:number,text:string){setQuestion((old)=>({...old,options:old.options.map((item,i)=>i===index?text:item)}));}
  function removeOption(index:number){setQuestion((old)=>{const options=old.options.filter((_,i)=>i!==index);return {...old,options,correctIndex:old.correctIndex===index?0:old.correctIndex>index?old.correctIndex-1:old.correctIndex};});}
  function submit(){const stem=question.stem.trim();const options=question.options.map((item)=>item.trim());if(!stem)return setValidation('Hãy nhập nội dung câu hỏi.');if(options.some((item)=>!item))return setValidation('Các lựa chọn không được để trống.');if(new Set(options.map((item)=>item.toLocaleLowerCase('vi'))).size!==options.length)return setValidation('Các lựa chọn phải khác nhau.');void onSave({...question,stem,options});}
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={styles.overlay}><View style={styles.sheet}><ScrollView keyboardShouldPersistTaps="handled"><Text style={styles.editorTitle}>{question.id?'Sửa câu hỏi':'Thêm câu hỏi'}</Text><TextInput multiline maxLength={500} value={question.stem} onChangeText={(stem)=>setQuestion((old)=>({...old,stem}))} placeholder="Nội dung câu hỏi" style={[styles.input,styles.stemInput]}/>{question.options.map((item,index)=><View key={index} style={styles.optionEditor}><Pressable onPress={()=>setQuestion((old)=>({...old,correctIndex:index}))} style={[styles.radio,question.correctIndex===index&&styles.radioActive]}><Text style={styles.radioText}>{question.correctIndex===index?'✓':String.fromCharCode(65+index)}</Text></Pressable><TextInput maxLength={200} value={item} onChangeText={(text)=>option(index,text)} placeholder={`Lựa chọn ${String.fromCharCode(65+index)}`} style={[styles.input,styles.optionInput]}/>{question.options.length>2?<Pressable onPress={()=>removeOption(index)} style={styles.remove}><Text style={styles.removeText}>×</Text></Pressable>:null}</View>)}{question.options.length<4?<Pressable onPress={()=>setQuestion((old)=>({...old,options:[...old.options,'']}))} style={styles.addOption}><Text style={styles.actionText}>＋ Thêm lựa chọn</Text></Pressable>:null}{validation?<Text style={styles.validation}>{validation}</Text>:null}<View style={styles.editorActions}><Pressable onPress={onClose} style={styles.cancel}><Text style={styles.cancelText}>Hủy</Text></Pressable><Pressable disabled={busy} onPress={submit} style={styles.save}><Text style={styles.saveText}>{busy?'Đang lưu…':'Lưu câu hỏi'}</Text></Pressable></View></ScrollView></View></KeyboardAvoidingView></Modal>;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:colors.canvas},flex:{flex:1},header:{paddingTop:Platform.OS==='android'?20:52,minHeight:104,paddingHorizontal:spacing.lg,paddingBottom:12,flexDirection:'row',alignItems:'center',gap:12,backgroundColor:colors.white,borderBottomWidth:1,borderBottomColor:colors.line},back:{width:42,height:42,borderRadius:14,backgroundColor:colors.canvas,alignItems:'center',justifyContent:'center'},backText:{fontSize:30,color:colors.ink,lineHeight:32},eyebrow:{...type.eyebrow,color:colors.purple},title:{color:colors.ink,fontSize:17,fontWeight:'900',marginTop:3},refresh:{width:42,height:42,borderRadius:14,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},refreshText:{fontSize:22,color:colors.greenDark,fontWeight:'900'},content:{padding:spacing.lg,paddingBottom:60,gap:14},tabs:{flexDirection:'row',padding:4,borderRadius:radius.lg,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line},tab:{flex:1,minHeight:44,alignItems:'center',justifyContent:'center',borderRadius:13},tabActive:{backgroundColor:colors.ink},tabText:{color:colors.muted,fontSize:11,fontWeight:'900'},tabTextActive:{color:colors.yellow},intro:{padding:16,borderRadius:radius.xl,backgroundColor:colors.greenSoft,flexDirection:'row',alignItems:'center',gap:10},introTitle:{color:colors.ink,fontSize:15,fontWeight:'900'},introText:{color:colors.muted,fontSize:10,lineHeight:15,marginTop:4},add:{minHeight:44,paddingHorizontal:13,borderRadius:13,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center'},addText:{color:colors.yellow,fontSize:10,fontWeight:'900'},card:{padding:15,borderRadius:radius.xl,backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,gap:10,...shadow.card},number:{...type.eyebrow,color:colors.green},stem:{color:colors.ink,fontSize:13,fontWeight:'900',lineHeight:19},options:{gap:7},option:{minHeight:40,paddingHorizontal:10,borderRadius:12,backgroundColor:colors.canvas,flexDirection:'row',alignItems:'center',gap:8},correct:{backgroundColor:colors.greenSoft,borderWidth:1,borderColor:'#BDE5CF'},optionLabel:{width:24,color:colors.muted,fontSize:10,fontWeight:'900'},optionText:{flex:1,color:colors.inkSoft,fontSize:11},correctText:{color:colors.greenDark,fontWeight:'900'},actions:{flexDirection:'row',gap:8},action:{flex:1,minHeight:42,borderRadius:12,backgroundColor:colors.greenSoft,alignItems:'center',justifyContent:'center'},actionText:{color:colors.greenDark,fontSize:10,fontWeight:'900'},danger:{backgroundColor:colors.coralSoft},dangerText:{color:colors.coral,fontSize:10,fontWeight:'900'},empty:{color:colors.muted,textAlign:'center',padding:30},overlay:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(10,35,24,.48)'},sheet:{maxHeight:'90%',padding:spacing.lg,paddingBottom:Platform.OS==='ios'?30:spacing.lg,backgroundColor:colors.white,borderTopLeftRadius:radius.xxl,borderTopRightRadius:radius.xxl},editorTitle:{...type.h2,color:colors.ink,marginBottom:16},input:{minHeight:52,paddingHorizontal:13,borderRadius:radius.md,borderWidth:1.5,borderColor:colors.line,color:colors.ink,fontSize:13},stemInput:{height:110,textAlignVertical:'top',paddingTop:13,marginBottom:12},optionEditor:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:9},optionInput:{flex:1},radio:{width:38,height:38,borderRadius:12,backgroundColor:colors.canvas,alignItems:'center',justifyContent:'center'},radioActive:{backgroundColor:colors.green},radioText:{color:colors.ink,fontSize:11,fontWeight:'900'},remove:{width:36,height:36,alignItems:'center',justifyContent:'center'},removeText:{color:colors.coral,fontSize:25},addOption:{minHeight:44,borderRadius:12,borderWidth:1,borderColor:colors.line,alignItems:'center',justifyContent:'center'},validation:{color:colors.coral,fontSize:11,fontWeight:'800',marginTop:10},editorActions:{flexDirection:'row',gap:10,marginTop:16},cancel:{minHeight:50,paddingHorizontal:22,borderRadius:radius.md,backgroundColor:colors.canvas,alignItems:'center',justifyContent:'center'},cancelText:{color:colors.inkSoft,fontWeight:'900'},save:{flex:1,minHeight:50,borderRadius:radius.md,backgroundColor:colors.ink,alignItems:'center',justifyContent:'center'},saveText:{color:colors.yellow,fontWeight:'900'}});
