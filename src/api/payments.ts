import { apiRequest } from './client';
import type { AccountPlan, Payment, PaymentPage, PaymentStatus, Plan } from './types';

export const plansApi = { list: () => apiRequest<Plan[]>('/api/plans') };
export const paymentsApi = {
  create: (kind: AccountPlan) => apiRequest<Payment>('/api/payments', { authenticated: true, body: { kind } }),
  createAddon: (kind: AccountPlan, packs = 1) => apiRequest<Payment>('/api/payments/addon', { authenticated: true, body: { kind, packs: Math.max(1, Math.floor(Number(packs) || 1)) } }),
  list: (page = 0, size = 10) => apiRequest<PaymentPage>(`/api/payments?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`, { authenticated: true }),
  status: (orderCode: number) => apiRequest<PaymentStatus>(`/api/payments/${orderCode}`, { authenticated: true }),
  cancel: (orderCode: number, reason = '') => apiRequest<void>(`/api/payments/${orderCode}/cancel${reason.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : ''}`, { authenticated: true, method: 'POST' }),
};
