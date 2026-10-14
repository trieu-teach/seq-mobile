import { apiRequest } from './client';
import type { AccountPlan, Payment, PaymentStatus, Plan } from './types';

export const plansApi = { list: () => apiRequest<Plan[]>('/api/plans') };
export const paymentsApi = {
  create: (kind: AccountPlan) => apiRequest<Payment>('/api/payments', { authenticated: true, body: { kind } }),
  status: (orderCode: number) => apiRequest<PaymentStatus>(`/api/payments/${orderCode}`, { authenticated: true }),
  cancel: (orderCode: number) => apiRequest<void>(`/api/payments/${orderCode}/cancel`, { authenticated: true, method: 'POST' }),
};
