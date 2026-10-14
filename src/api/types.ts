export type AccountPlan = 'PARENT' | 'TEACHER';
export type GroupContext = 'FAMILY' | 'CLASS';
export type Account = { id: string; email: string; displayName: string; phone?: string | null; plans: AccountPlan[]; roles: string[] };
export type TokenResult = { accessToken: string; refreshToken?: string | null; expiresIn: number };
export type Entitlement = { id: string; kind: AccountPlan; startsOn: string; expiresOn: string; [key: string]: unknown };
export type Group = { id: string; name: string; context: GroupContext; status?: string; closedAt?: string | null; consentConfirmed?: boolean; slotLimit?: number; slotUsed?: number; [key: string]: unknown };
export type Slot = { id: string; code?: string; displayName: string; badge?: string | null; status?: string; locked?: boolean; groupContext?: GroupContext; [key: string]: unknown };
export type GroupCapacity = number;
export type Plan = { kind: AccountPlan; price: number; months: number; updatedAt?: string };
export type Payment = { orderCode: number; qrCode?: string; bin: string; accountNumber: string; accountName: string; amount: number; description: string; expiresAt: string };
export type PaymentStatus = { orderCode: number; status: 'PENDING' | 'PAID' | 'FAILED'; amount: number; paidAt?: string | null };

export type LearnerIndicators = {
  wealth: number;
  saving: number;
  happiness: number;
  risk: number;
  goal: number;
};

export type SlotReport = {
  learner: {
    id: string;
    code: string | null;
    displayName: string | null;
    badge: string | null;
    status: 'ACTIVE' | 'ARCHIVED' | 'WIPED';
    group: { id: string; name: string; context: GroupContext; closedAt: string | null };
    createdAt: string;
    archivedAt: string | null;
    wipedAt: string | null;
    lastActiveAt: string | null;
  };
  progress: {
    totalChapters: number;
    completedChapters: number;
    chaptersDone: number[];
    continueChapter: number | null;
    attemptIndex: number;
    lastPlayedAt: string | null;
  };
  indicators: LearnerIndicators | null;
  achievements: { code: string; earnedAt: string }[];
  concepts: unknown[];
  chapters: unknown[];
  quizzes: unknown | null;
  dailySummary: { date: string; text: string; source: string } | null;
};

export type GroupReport = {
  group: { id: string; name: string; context: GroupContext; slotLimit: number; openedAt: string; closedAt: string | null };
  frozenAt: string | null;
  formulaVersion: string | null;
  summary: {
    learners: number;
    active: number;
    activeLast7Days: number;
    chaptersCompleted: number;
    totalChapters: number;
    quizAssigned: number;
    quizSubmitted: number;
    averageScore: number | null;
  };
  rows: {
    slotId: string;
    code: string | null;
    displayName: string | null;
    status: 'ACTIVE' | 'ARCHIVED' | 'WIPED';
    chaptersDone: number[];
    completedChapters: number;
    attemptIndex: number;
    lastActiveAt: string | null;
    indicators: LearnerIndicators | null;
    quizAssigned: number;
    quizSubmitted: number;
    averageScore: number | null;
  }[];
};
