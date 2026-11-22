import { useCallback, useEffect, useState } from 'react';
import { entitlementsApi, groupsApi, reportsApi, type Entitlement, type Group, type GroupReport, type Slot, type SlotQuota } from '@/api';
import { useAuth } from '@/features/auth/auth-context';

export function useWorkspaceData(selectedGroupId?: string) {
  const { session } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [quota, setQuota] = useState<SlotQuota | null>(null);
  const [report, setReport] = useState<GroupReport | null>(null);
  const [reports, setReports] = useState<GroupReport[]>([]);
  const [reportWarning, setReportWarning] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const context = session?.role === 'TEACHER' ? 'CLASS' : 'FAMILY';

  const reload = useCallback(async () => {
    if (!session) {
      setLoading(false); setError(''); setEntitlements([]);
      setGroups([]); setSlots([]); setCapacity(null); setQuota(null); setReport(null); setReports([]); setReportWarning('');
      return;
    }
    setLoading(true); setError('');
    try {
      const [nextEntitlements, nextGroups, quotaResponse] = await Promise.all([entitlementsApi.list(), groupsApi.list(), groupsApi.quota()]);
      const quotas = Array.isArray(quotaResponse) ? quotaResponse : quotaResponse.items ?? quotaResponse.quotas ?? [];
      const nextQuota = quotas.find((item) => item.context === context || item.plan === session.role) ?? null;
      const contextGroups = (nextGroups ?? []).filter((item) => item.context === context).sort((a, b) => Number(Boolean(a.closedAt)) - Number(Boolean(b.closedAt)));
      const openGroups = contextGroups.filter((item) => !item.closedAt);
      const activeGroup = openGroups.find((item) => item.id === selectedGroupId) ?? openGroups[0] ?? null;
      setEntitlements(nextEntitlements ?? []); setGroups(nextGroups ?? []); setQuota(nextQuota);
      const settledReports = await Promise.allSettled(contextGroups.map((item) => reportsApi.group(item.id)));
      const nextReports = settledReports.flatMap((item) => item.status === 'fulfilled' && item.value ? [item.value] : []);
      const failedReports = settledReports.length - nextReports.length;
      setReports(nextReports); setReportWarning(failedReports ? `${failedReports} nhóm chưa tải được báo cáo.` : '');
      if (activeGroup) {
        const [nextSlots, nextCapacity] = await Promise.all([
          groupsApi.slots(activeGroup.id), groupsApi.capacity(activeGroup.id),
        ]);
        const capacityValue = typeof nextCapacity === 'object' ? nextCapacity.free ?? nextCapacity.available : nextCapacity;
        setSlots(nextSlots ?? []); setCapacity(Number.isFinite(Number(capacityValue)) ? Number(capacityValue) : null); setReport(nextReports.find((item) => item.group.id === activeGroup.id) ?? nextReports[0] ?? null);
      } else { setSlots([]); setCapacity(null); setReport(nextReports[0] ?? null); }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu từ máy chủ.');
    } finally { setLoading(false); }
  }, [context, selectedGroupId, session]);

  // The first server synchronization intentionally owns this hook's loading state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);
  const contextGroups = groups.filter((item) => item.context === context).sort((a, b) => Number(Boolean(a.closedAt)) - Number(Boolean(b.closedAt)));
  const openGroups = contextGroups.filter((item) => !item.closedAt);
  const group = openGroups.find((item) => item.id === selectedGroupId) ?? openGroups[0] ?? null;
  const entitlement = entitlements.find((item) => item.kind === session?.role) ?? null;
  return { capacity, contextGroups, entitlement, error, group, groups, loading, openGroups, quota, reload, report, reports, reportWarning, slots };
}
