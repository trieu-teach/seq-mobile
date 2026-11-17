import { useCallback, useEffect, useState } from 'react';
import { entitlementsApi, groupsApi, reportsApi, type Entitlement, type Group, type GroupReport, type Slot } from '@/api';
import { useAuth } from '@/features/auth/auth-context';

export function useWorkspaceData() {
  const { session } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [report, setReport] = useState<GroupReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const context = session?.role === 'TEACHER' ? 'CLASS' : 'FAMILY';

  const reload = useCallback(async () => {
    if (!session) {
      setLoading(false); setError(''); setEntitlements([]);
      setGroups([]); setSlots([]); setCapacity(null); setReport(null);
      return;
    }
    setLoading(true); setError('');
    try {
      const [nextEntitlements, nextGroups] = await Promise.all([entitlementsApi.list(), groupsApi.list()]);
      const activeGroup = (nextGroups ?? []).find((item) => item.context === context && !item.closedAt) ?? null;
      setEntitlements(nextEntitlements ?? []); setGroups(nextGroups ?? []);
      if (activeGroup) {
        const [nextSlots, nextCapacity, nextReport] = await Promise.all([
          groupsApi.slots(activeGroup.id), groupsApi.capacity(activeGroup.id), reportsApi.group(activeGroup.id),
        ]);
        setSlots(nextSlots ?? []); setCapacity(Number.isFinite(Number(nextCapacity)) ? Number(nextCapacity) : null); setReport(nextReport);
      } else { setSlots([]); setCapacity(null); setReport(null); }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu từ máy chủ.');
    } finally { setLoading(false); }
  }, [context, session]);

  // The first server synchronization intentionally owns this hook's loading state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);
  const group = groups.find((item) => item.context === context && !item.closedAt) ?? null;
  const entitlement = entitlements.find((item) => item.kind === session?.role) ?? null;
  return { capacity, entitlement, error, group, groups, loading, reload, report, slots };
}
