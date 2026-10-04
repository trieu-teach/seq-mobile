import * as SecureStore from 'expo-secure-store';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

const SESSION_KEY = 'finteen.account.session';
export type AccountRole = 'PARENT' | 'TEACHER';
export type Session = { accountId: string; email: string; displayName: string; role: AccountRole; token: string };
type SignInResult = { ok: true } | { ok: false; message: string };
type AuthContextValue = { isLoading: boolean; session: Session | null; signIn: (email: string, password: string) => Promise<SignInResult>; signUp: (input: { name: string; email: string; password: string; role: AccountRole }) => Promise<SignInResult>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

async function readSession() {
  const value = Platform.OS === 'web' ? globalThis.localStorage?.getItem(SESSION_KEY) ?? null : await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) return null;
  try { return JSON.parse(value) as Session; } catch { return null; }
}
async function writeSession(session: Session | null) {
  if (Platform.OS === 'web') {
    if (session) globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session)); else globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  if (session) await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)); else await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { readSession().then(setSession).catch(() => setSession(null)).finally(() => setIsLoading(false)); }, []);
  const value = useMemo<AuthContextValue>(() => ({
    isLoading, session,
    async signIn(email, password) {
      const normalizedEmail = email.trim().toLowerCase();
      // Context chưa chốt API đăng nhập ACCOUNT; đây là tài khoản mẫu, không phải xác thực production.
      const role: AccountRole | null = normalizedEmail === 'phuhuynh@finteen.vn' ? 'PARENT' : normalizedEmail === 'giaovien@finteen.vn' ? 'TEACHER' : null;
      if (!role || password !== '2026') return { ok: false, message: 'Email hoặc mật khẩu chưa đúng.' };
      const nextSession: Session = { accountId: role === 'PARENT' ? 'account-parent-demo' : 'account-teacher-demo', email: normalizedEmail, displayName: role === 'PARENT' ? 'Nguyễn Thu Hà' : 'Trần Minh Khoa', role, token: 'demo-account-token' };
      setSession(nextSession); await writeSession(nextSession); return { ok: true };
    },
    async signUp(input) {
      const nextSession: Session = { accountId: `account-demo-${Date.now()}`, email: input.email.trim().toLowerCase(), displayName: input.name.trim(), role: input.role, token: 'demo-account-token' };
      setSession(nextSession); await writeSession(nextSession); return { ok: true };
    },
    async signOut() { setSession(null); await writeSession(null); },
  }), [isLoading, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
