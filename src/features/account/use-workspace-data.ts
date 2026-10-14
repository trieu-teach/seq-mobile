import { useCallback, useEffect, useState } from 'react';
import { entitlementsApi, groupsApi, type Entitlement, type Group, type Slot } from '@/api';
import { useAuth } from '@/features/auth/auth-context';

export function useWorkspaceData() {
  const { isGuest, session } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const context = session?.role === 'TEACHER' ? 'CLASS' : 'FAMILY';

  const reload = useCallback(async () => {
    if (!session) {
      setLoading(false); setError(''); setEntitlements([]);
      if (isGuest) {
        setGroups([{ id: 'guest-family', name: 'Gia đình mẫu', context: 'FAMILY', slotLimit: 4, slotUsed: 2, consentConfirmed: true }]);
        setSlots([
          { id: 'guest-an', code: 'AN2026', displayName: 'Nguyễn Minh An', status: 'ACTIVE', groupContext: 'FAMILY' },
          { id: 'guest-linh', code: 'LINH2026', displayName: 'Nguyễn Gia Linh', status: 'ACTIVE', groupContext: 'FAMILY' },
        ]);
        setCapacity(2);
      } else { setGroups([]); setSlots([]); setCapacity(null); }
      return;
    }
    setLoading(true); setError('');
    try {
      const [nextEntitlements, nextGroups] = await Promise.all([entitlementsApi.list(), groupsApi.list()]);
      const activeGroup = (nextGroups ?? []).find((item) => item.context === context && !item.closedAt) ?? null;
      setEntitlements(nextEntitlements ?? []); setGroups(nextGroups ?? []);
      if (activeGroup) {
        const [nextSlots, nextCapacity] = await Promise.all([groupsApi.slots(activeGroup.id), groupsApi.capacity(activeGroup.id)]);
        setSlots(nextSlots ?? []); setCapacity(Number.isFinite(Number(nextCapacity)) ? Number(nextCapacity) : null);
      } else { setSlots([]); setCapacity(null); }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu từ máy chủ.');
    } finally { setLoading(false); }
  }, [context, isGuest, session]);

  // The first server synchronization intentionally owns this hook's loading state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);
  const group = groups.find((item) => item.context === context && !item.closedAt) ?? null;
  const entitlement = entitlements.find((item) => item.kind === session?.role) ?? null;
  return { capacity, entitlement, error, group, groups, loading, reload, slots };
}
