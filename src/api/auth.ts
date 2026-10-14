import { apiRequest } from './client';
import type { Account, TokenResult } from './types';
export const authApi = {
  register: (email: string, password: string, displayName: string, phone?: string) => apiRequest<Account>('/api/auth/register', { body: { email: email.trim().toLowerCase(), password, displayName: displayName.trim(), ...(phone?.trim() ? { phone: phone.trim() } : {}) } }),
  verify: (email: string, otp: string) => apiRequest<TokenResult>('/api/auth/verify', { body: { email: email.trim().toLowerCase(), otp: otp.trim() } }),
  resendVerification: (email: string) => apiRequest<void>(`/api/auth/verify/resend?email=${encodeURIComponent(email.trim().toLowerCase())}`, { method: 'POST' }),
  login: (email: string, password: string) => apiRequest<TokenResult>('/api/auth/login', { body: { email: email.trim().toLowerCase(), password } }),
  loginGoogle: (idToken: string) => apiRequest<TokenResult>('/api/auth/login/google', { body: { provider: 'GOOGLE', idToken } }),
  linkGoogle: (idToken: string) => apiRequest<void>('/api/auth/link/google', { authenticated: true, body: { provider: 'GOOGLE', idToken } }),
  me: () => apiRequest<Account>('/api/auth/me', { authenticated: true }),
  changePassword: (oldPassword: string, newPassword: string) => apiRequest<TokenResult>('/api/auth/password/change', { authenticated: true, body: { oldPassword, newPassword } }),
  forgotPassword: (email: string) => apiRequest<void>('/api/auth/password/forgot', { body: { email: email.trim() } }),
  resetPassword: (email: string, otp: string, newPassword: string) => apiRequest<void>('/api/auth/password/reset', { body: { email: email.trim(), otp: otp.trim(), newPassword } }),
};
