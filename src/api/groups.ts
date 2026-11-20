import { apiRequest } from './client';
import type { Group, GroupCapacity, GroupContext, QuotaResponse, Slot } from './types';
const idPath = (id: string) => encodeURIComponent(id);
export const groupsApi = {
  create: (name: string, context: GroupContext, plannedSize?: number) => apiRequest<Group>('/api/groups', { authenticated: true, body: { name: name.trim(), context, ...(context === 'CLASS' && plannedSize ? { plannedSize } : {}) } }),
  list: () => apiRequest<Group[]>('/api/groups', { authenticated: true }),
  slots: (groupId: string) => apiRequest<Slot[]>(`/api/groups/${idPath(groupId)}/slots`, { authenticated: true }),
  capacity: (groupId: string) => apiRequest<GroupCapacity>(`/api/groups/${idPath(groupId)}/capacity`, { authenticated: true }),
  consent: (groupId: string) => apiRequest<void>(`/api/groups/${idPath(groupId)}/consent`, { authenticated: true, method: 'POST' }),
  close: (groupId: string) => apiRequest<void>(`/api/groups/${idPath(groupId)}/close`, { authenticated: true, method: 'POST' }),
  quota: () => apiRequest<QuotaResponse>('/api/me/quota', { authenticated: true }),
};
