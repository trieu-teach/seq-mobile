import * as SecureStore from 'expo-secure-store';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { ApiError, authApi, type Account, type AccountPlan, type TokenResult } from '@/api';
import { setApiAccessToken } from '@/api/client';

const SESSION_KEY = 'finteen.account.session.v1';
export type AccountRole = AccountPlan;
export type Session = {
  account: Account;
  accountId: string;
  email: string;
  displayName: string;
  role: AccountRole;
  token: string;
  accessToken: string;
  expiresAt: number;
};
type Result = { ok: true; hasPlan?: boolean } | { ok: false; message: string };
type AuthContextValue = { isGuest: boolean; isLoading: boolean; session: Session | null; continueAsGuest: () => void; refreshAccount: () => Promise<Result>; register: (email: string, password: string, displayName: string, phone?: string) => Promise<Result>; verifyRegistration: (email: string, otp: string) => Promise<Result>; resendVerification: (email: string) => Promise<Result>; setRole: (role: AccountRole) => Promise<Result>; signIn: (email: string, password: string) => Promise<Result>; changePassword: (oldPassword: string, newPassword: string) => Promise<Result>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

function messageOf(error: unknown) { return error instanceof ApiError || error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.'; }
function allowedRole(account: Account, preferred?: AccountRole) {
  if (preferred && account.plans.includes(preferred)) return preferred;
  return account.plans.find((plan) => plan === 'PARENT' || plan === 'TEACHER') ?? 'PARENT';
}
async function readStoredSession() {
  const value = Platform.OS === 'web' ? globalThis.localStorage?.getItem(SESSION_KEY) ?? null : await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) return null;
  try { const session = JSON.parse(value) as Session; return session.accessToken && session.expiresAt > Date.now() ? session : null; } catch { return null; }
}
async function storeSession(session: Session | null) {
  if (Platform.OS === 'web') {
    if (session) globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session)); else globalThis.localStorage?.removeItem(SESSION_KEY);
  } else if (session) await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)); else await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  async function establishSession(token: TokenResult) {
    if (!token.accessToken || !(token.expiresIn > 0)) throw new ApiError('Máy chủ chưa trả phiên đăng nhập hợp lệ.');
    setApiAccessToken(token.accessToken);
    try {
      const account = await authApi.me();
      const role = allowedRole(account);
      const next: Session = {
        account,
        accountId: account.id,
        email: account.email,
        displayName: account.displayName,
        role,
        token: token.accessToken,
        accessToken: token.accessToken,
        expiresAt: Date.now() + token.expiresIn * 1000,
      };
      setSession(next); await storeSession(next);
      return next;
    } catch (error) { setApiAccessToken(null); throw error; }
  }
  useEffect(() => {
    void (async () => {
      const saved = await readStoredSession();
      if (!saved) { await storeSession(null); return; }
      setApiAccessToken(saved.accessToken);
      try {
        const account = await authApi.me();
        const role = allowedRole(account, saved.role);
        const refreshed: Session = { ...saved, account, accountId: account.id, email: account.email, displayName: account.displayName, role };
        setSession(refreshed); await storeSession(refreshed);
      }
      catch { setApiAccessToken(null); await storeSession(null); }
    })().finally(() => setIsLoading(false));
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    isGuest, isLoading, session,
    continueAsGuest() { setIsGuest(true); },
    async refreshAccount() { try { if (!session) throw new ApiError('Vui lòng đăng nhập lại.'); const account = await authApi.me(); const next = { ...session, account, role: allowedRole(account, session.role) }; setSession(next); await storeSession(next); return { ok: true }; } catch (error) { return { ok: false, message: messageOf(error) }; } },
    async register(email, password, displayName, phone) { try { await authApi.register(email, password, displayName, phone); return { ok: true }; } catch (error) { return { ok: false, message: messageOf(error) }; } },
    async verifyRegistration(email, otp) { try { const next = await establishSession(await authApi.verify(email, otp)); setIsGuest(false); return { ok: true, hasPlan: next.account.plans.length > 0 }; } catch (error) { return { ok: false, message: messageOf(error) }; } },
    async resendVerification(email) { try { await authApi.resendVerification(email); return { ok: true }; } catch (error) { return { ok: false, message: messageOf(error) }; } },
    async setRole(role) {
      if (!session?.account.plans.includes(role)) return { ok: false, message: 'Tài khoản chưa có gói cho vai trò này.' };
      const next = { ...session, role };
      setSession(next); await storeSession(next);
      return { ok: true };
    },
    async signIn(email, password) { try { const next = await establishSession(await authApi.login(email, password)); setIsGuest(false); return { ok: true, hasPlan: next.account.plans.length > 0 }; } catch (error) { return { ok: false, message: messageOf(error) }; } },
    async changePassword(oldPassword, newPassword) { try { await establishSession(await authApi.changePassword(oldPassword, newPassword)); return { ok: true }; } catch (error) { return { ok: false, message: messageOf(error) }; } },
    async signOut() { setApiAccessToken(null); setSession(null); setIsGuest(false); await storeSession(null); },
  }), [isGuest, isLoading, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
