import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brand } from "@/components/brand";
import { useAuth } from "@/features/auth/auth-context";
import { colors, radius, shadow, spacing, type } from "@/theme/tokens";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  function fillDemoAccount(kind: "parent" | "teacher") {
    setEmail(kind === "teacher" ? "giaovien@finteen.vn" : "phuhuynh@finteen.vn");
    setPassword("2026");
    setError("");
  }
  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }
  async function submit() {
    if (!email.trim() || !password) {
      setError("Hãy nhập email và mật khẩu.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace("/(tabs)");
  }
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.top}>
            <Pressable
              accessibilityLabel="Quay lại"
              onPress={goBack}
              style={styles.back}
            >
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Brand />
          </View>
          <View style={styles.welcome}>
            <View style={styles.lock}>
              <Text style={styles.lockText}>F</Text>
            </View>
            <Text style={styles.eyebrow}>CHÀO MỪNG TRỞ LẠI</Text>
            <Text style={styles.title}>Đăng nhập FinTeen</Text>
            <Text style={styles.subtitle}>
              Xem cập nhật mới nhất từ gia đình hoặc lớp học của bạn.
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!busy}
              keyboardType="email-address"
              onChangeText={(value) => {
                setEmail(value);
                setError("");
              }}
              placeholder="ten@email.com"
              placeholderTextColor="#9AA69F"
              style={styles.input}
              value={email}
            />
            <Text style={styles.label}>Mật khẩu</Text>
            <View>
              <TextInput
                editable={!busy}
                onChangeText={(value) => {
                  setPassword(value);
                  setError("");
                }}
                onSubmitEditing={submit}
                secureTextEntry={!show}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9AA69F"
                style={[styles.input, styles.password]}
                value={password}
              />
              <Pressable
                onPress={() => setShow((value) => !value)}
                style={styles.show}
              >
                <Text style={styles.showText}>{show ? "Ẩn" : "Hiện"}</Text>
              </Pressable>
            </View>
            <Pressable style={styles.forgot}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </Pressable>
            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}
            <Pressable
              disabled={busy}
              onPress={submit}
              style={({ pressed }) => [
                styles.login,
                (pressed || busy) && styles.pressed,
              ]}
            >
              {busy ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <>
                  <Text style={styles.loginText}>Đăng nhập</Text>
                  <Text style={styles.arrow}>→</Text>
                </>
              )}
            </Pressable>
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>HOẶC</Text>
              <View style={styles.line} />
            </View>
            <Pressable
              onPress={() => router.push("/register")}
              style={styles.register}
            >
              <Text style={styles.registerText}>
                Chưa có tài khoản?{" "}
                <Text style={styles.registerStrong}>Đăng ký</Text>
              </Text>
            </Pressable>
          </View>
          <View style={styles.demo}>
            <Text style={styles.demoTitle}>DÙNG THỬ NHANH</Text>
            <View style={styles.demoAccounts}>
              <Pressable onPress={() => fillDemoAccount("parent")} style={({ pressed }) => [styles.demoAccount, pressed && styles.pressed]}>
                <View style={styles.demoMark}><Text style={styles.demoMarkText}>PH</Text></View>
                <View style={styles.demoCopy}><Text style={styles.demoRole}>Phụ huynh</Text><Text style={styles.demoText}>phuhuynh@finteen.vn</Text></View>
                <Text style={styles.demoAction}>Dùng →</Text>
              </Pressable>
              <Pressable onPress={() => fillDemoAccount("teacher")} style={({ pressed }) => [styles.demoAccount, styles.teacherAccount, pressed && styles.pressed]}>
                <View style={[styles.demoMark, styles.teacherMark]}><Text style={styles.demoMarkText}>GV</Text></View>
                <View style={styles.demoCopy}><Text style={styles.demoRole}>Giáo viên</Text><Text style={styles.demoText}>giaovien@finteen.vn</Text></View>
                <Text style={styles.demoAction}>Dùng →</Text>
              </Pressable>
            </View>
            <Text style={styles.demoPassword}>Mật khẩu chung: 2026</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: 24 },
  top: { height: 66, flexDirection: "row", alignItems: "center", gap: 14 },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  backText: { color: colors.ink, fontSize: 30, lineHeight: 31 },
  welcome: { alignItems: "center", paddingTop: 18, paddingBottom: 24 },
  lock: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }],
    ...shadow.card,
  },
  lockText: { color: colors.white, fontSize: 31, fontWeight: "900" },
  eyebrow: { ...type.eyebrow, color: colors.green, marginTop: 20 },
  title: { ...type.h1, color: colors.ink, marginTop: 5 },
  subtitle: {
    ...type.body,
    color: colors.muted,
    textAlign: "center",
    marginTop: 7,
    maxWidth: 340,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  label: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7,
    marginTop: 5,
  },
  input: {
    height: 55,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: "#FCFDFB",
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  password: { paddingRight: 68 },
  show: { position: "absolute", right: 10, top: 6, padding: 12 },
  showText: { color: colors.greenDark, fontWeight: "900", fontSize: 12 },
  forgot: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { color: colors.greenDark, fontSize: 11, fontWeight: "800" },
  error: { color: "#B44F35", fontSize: 12, fontWeight: "700", marginTop: 10 },
  login: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.yellow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 18,
    ...shadow.button,
  },
  loginText: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  arrow: { color: colors.ink, fontSize: 21 },
  pressed: { opacity: 0.7 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 18,
  },
  line: { height: 1, backgroundColor: colors.line, flex: 1 },
  or: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  register: { alignItems: "center" },
  registerText: { color: colors.muted, fontSize: 12 },
  registerStrong: { color: colors.greenDark, fontWeight: "900" },
  demo: {
    marginTop: 18,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.greenSoft,
  },
  demoTitle: {
    color: colors.greenDark,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  demoAccounts:{gap:8,marginTop:10},
  demoAccount:{minHeight:58,padding:9,flexDirection:"row",alignItems:"center",gap:10,borderRadius:radius.md,backgroundColor:colors.white,borderWidth:1,borderColor:"#BDE5CF"},
  teacherAccount:{borderColor:"#D8CDF4"},
  demoMark:{width:38,height:38,borderRadius:12,backgroundColor:colors.green,alignItems:"center",justifyContent:"center"},
  teacherMark:{backgroundColor:colors.purple},
  demoMarkText:{color:colors.white,fontSize:10,fontWeight:"900"},
  demoCopy:{flex:1},
  demoRole:{color:colors.ink,fontSize:12,fontWeight:"900"},
  demoText: { color: colors.muted, fontSize: 9, marginTop: 2 },
  demoAction:{color:colors.greenDark,fontSize:10,fontWeight:"900"},
  demoPassword:{color:colors.inkSoft,fontSize:9,textAlign:"center",marginTop:9},
});
