import { router } from "expo-router";
import { useState } from "react";
import {
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
import { type AccountRole, useAuth } from "@/features/auth/auth-context";
import { colors, radius, shadow, spacing, type } from "@/theme/tokens";

export default function RegisterScreen() {
  const [role, setRole] = useState<AccountRole>("PARENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signUp } = useAuth();
  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }
  async function submit() {
    if (!name.trim() || !email.includes("@") || password.length < 6) {
      setError("Hãy nhập đủ thông tin; mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }
    if (!agree) {
      setError("Bạn cần đồng ý với điều khoản và chính sách riêng tư.");
      return;
    }
    setBusy(true);
    await signUp({ name, email, password, role });
    setBusy(false);
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
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>BẮT ĐẦU CÙNG FINTEEN</Text>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Chọn vai trò để FinTeen chuẩn bị không gian theo dõi phù hợp.
            </Text>
          </View>
          <View style={styles.roleRow}>
            {(
              [
                {
                  key: "PARENT",
                  title: "Phụ huynh",
                  caption: "Theo dõi gia đình",
                  mark: "PH",
                },
                {
                  key: "TEACHER",
                  title: "Giáo viên",
                  caption: "Theo dõi lớp học",
                  mark: "GV",
                },
              ] as const
            ).map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setRole(item.key)}
                style={[styles.role, role === item.key && styles.roleActive]}
              >
                <View
                  style={[
                    styles.roleMark,
                    role === item.key && styles.roleMarkActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleMarkText,
                      role === item.key && styles.roleMarkTextActive,
                    ]}
                  >
                    {item.mark}
                  </Text>
                </View>
                <View>
                  <Text style={styles.roleTitle}>{item.title}</Text>
                  <Text style={styles.roleCaption}>{item.caption}</Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    role === item.key && styles.radioActive,
                  ]}
                >
                  {role === item.key && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            ))}
          </View>
          <View style={styles.form}>
            <Field
              label="Họ và tên"
              value={name}
              onChange={setName}
              placeholder="Nguyễn Thu Hà"
            />
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="ten@email.com"
              keyboard="email-address"
            />
            <Field
              label="Mật khẩu"
              value={password}
              onChange={setPassword}
              placeholder="Tối thiểu 6 ký tự"
              secure
            />
            <Field
              label="Xác nhận mật khẩu"
              value={confirm}
              onChange={setConfirm}
              placeholder="Nhập lại mật khẩu"
              secure
            />
            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}
            <Pressable
              onPress={() => setAgree((value) => !value)}
              style={styles.agree}
            >
              <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                <Text style={styles.check}>{agree ? "✓" : ""}</Text>
              </View>
              <Text style={styles.agreeText}>
                Tôi đồng ý với{" "}
                <Text style={styles.link}>Điều khoản sử dụng</Text> và{" "}
                <Text style={styles.link}>Chính sách riêng tư</Text>.
              </Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={submit}
              style={({ pressed }) => [
                styles.submit,
                (pressed || busy) && styles.pressed,
              ]}
            >
              <Text style={styles.submitText}>
                {busy ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Text>
              <Text style={styles.submitArrow}>→</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.hasAccount}
          >
            <Text style={styles.hasAccountText}>
              Đã có tài khoản? <Text style={styles.link}>Đăng nhập</Text>
            </Text>
          </Pressable>
          <Text style={styles.backendNote}>
            Bản hiện tại tạo tài khoản mẫu trên thiết bị. Tài khoản thật sẽ được
            nối khi API ACCOUNT được chốt.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  secure = false,
  keyboard = "default",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  secure?: boolean;
  keyboard?: "default" | "email-address";
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={keyboard === "email-address" ? "none" : "words"}
        autoCorrect={false}
        keyboardType={keyboard}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9AA69F"
        secureTextEntry={secure}
        style={styles.input}
        value={value}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 28 },
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
  heading: { paddingTop: 14, paddingBottom: 20 },
  eyebrow: { ...type.eyebrow, color: colors.green },
  title: { ...type.h1, color: colors.ink, marginTop: 5 },
  subtitle: { ...type.body, color: colors.muted, marginTop: 6 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  role: {
    flex: 1,
    minHeight: 76,
    padding: 11,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleActive: { borderColor: colors.green, backgroundColor: "#F1FAF5" },
  roleMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  roleMarkActive: { backgroundColor: colors.green },
  roleMarkText: { color: colors.muted, fontSize: 10, fontWeight: "900" },
  roleMarkTextActive: { color: colors.white },
  roleTitle: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  roleCaption: { color: colors.muted, fontSize: 8, marginTop: 2 },
  radio: {
    marginLeft: "auto",
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#B7C1BB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: colors.green },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  form: {
    padding: spacing.lg,
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  label: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 6,
  },
  input: {
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: "#FCFDFB",
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  error: {
    color: "#B44F35",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
  },
  agree: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#B7C1BB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: colors.green, borderColor: colors.green },
  check: { color: colors.white, fontSize: 12, fontWeight: "900" },
  agreeText: { flex: 1, color: colors.muted, fontSize: 10, lineHeight: 16 },
  link: { color: colors.greenDark, fontWeight: "900" },
  submit: {
    height: 55,
    borderRadius: radius.md,
    backgroundColor: colors.yellow,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 18,
    ...shadow.button,
  },
  submitText: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  submitArrow: { color: colors.ink, fontSize: 20 },
  pressed: { opacity: 0.7 },
  hasAccount: { alignItems: "center", padding: 18 },
  hasAccountText: { color: colors.muted, fontSize: 12 },
  backendNote: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
