import { apiRequest } from './client';
import type { Group, GroupCapacity, GroupContext, Slot } from './types';
const idPath = (id: string) => encodeURIComponent(id);
export const groupsApi = {
  create: (name: string, context: GroupContext) => apiRequest<Group>('/api/groups', { authenticated: true, body: { name: name.trim(), context } }),
  list: () => apiRequest<Group[]>('/api/groups', { authenticated: true }),
  slots: (groupId: string) => apiRequest<Slot[]>(`/api/groups/${idPath(groupId)}/slots`, { authenticated: true }),
  capacity: (groupId: string) => apiRequest<GroupCapacity>(`/api/groups/${idPath(groupId)}/capacity`, { authenticated: true }),
  consent: (groupId: string) => apiRequest<void>(`/api/groups/${idPath(groupId)}/consent`, { authenticated: true, method: 'POST' }),
  close: (groupId: string) => apiRequest<void>(`/api/groups/${idPath(groupId)}/close`, { authenticated: true, method: 'POST' }),
  setPostTest: (groupId: string, enabled: boolean) => apiRequest<void>(`/api/groups/${idPath(groupId)}/post-test`, { authenticated: true, body: { enabled } }),
};
