import { apiRequest } from './client';
import type { GroupReport, SlotReport } from './types';

const idPath = (id: string) => encodeURIComponent(id);

export const reportsApi = {
  slot: (slotId: string) => apiRequest<SlotReport>(`/api/slots/${idPath(slotId)}/report`, { authenticated: true }),
  group: (groupId: string) => apiRequest<GroupReport>(`/api/groups/${idPath(groupId)}/report`, { authenticated: true }),
};
