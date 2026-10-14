import { apiRequest } from './client';
import type { Entitlement } from './types';
export const entitlementsApi = { list: () => apiRequest<Entitlement[]>('/api/entitlements', { authenticated: true }) };
