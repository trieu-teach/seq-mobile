import { apiRequest } from './client';
import type { Slot } from './types';
export type CreateSlotInput = { groupId: string; displayName: string; pin: string; badge?: string };
const idPath = (id: string) => encodeURIComponent(id);
const slotBody = ({ groupId, displayName, pin, badge }: CreateSlotInput) => ({ groupId, displayName: displayName.trim(), pin, ...(badge ? { badge } : {}) });
export const slotsApi = {
  create: (input: CreateSlotInput) => apiRequest<Slot>('/api/slots', { authenticated: true, body: slotBody(input) }),
  createBulk: (groupId: string, slots: Omit<CreateSlotInput, 'groupId'>[]) => apiRequest<Slot[]>('/api/slots/bulk', { authenticated: true, body: { slots: slots.map((slot) => slotBody({ ...slot, groupId })) } }),
  return: (slotId: string) => apiRequest<void>(`/api/slots/${idPath(slotId)}/return`, { authenticated: true, method: 'POST' }),
  changePin: (slotId: string, pin: string) => apiRequest<void>(`/api/slots/${idPath(slotId)}/pin`, { authenticated: true, body: { pin } }),
  remove: (slotId: string) => apiRequest<void>(`/api/slots/${idPath(slotId)}`, { authenticated: true, method: 'DELETE' }),
};
