export type AccountPlan = 'PARENT' | 'TEACHER';
export type GroupContext = 'FAMILY' | 'CLASS';
export type Account = { id: string; email: string; displayName: string; phone?: string | null; plans: AccountPlan[]; roles: string[] };
export type TokenResult = { accessToken: string; refreshToken?: string | null; expiresIn: number };
export type Entitlement = { id: string; kind: AccountPlan; startsOn: string; expiresOn: string; [key: string]: unknown };
export type Group = { id: string; name: string; context: GroupContext; status?: string; closedAt?: string | null; consentConfirmed?: boolean; slotLimit?: number; slotUsed?: number; [key: string]: unknown };
export type Slot = { id: string; code?: string; displayName: string; badge?: string | null; status?: string; locked?: boolean; groupContext?: GroupContext; [key: string]: unknown };
export type GroupCapacity = number | { free?: number; available?: number };
export type SlotQuota = { context?: GroupContext; plan?: AccountPlan; limit: number; used: number; reserved: number; free: number; base: number; extra: number; wiped: number };
export type QuotaResponse = SlotQuota[] | { items?: SlotQuota[]; quotas?: SlotQuota[] };
export type Plan = { kind: AccountPlan; price: number; addonPrice?: number | null; addonSlots?: number | null; updatedAt?: string };
export type PaymentPurpose = 'NEW' | 'RENEW' | 'ADDON';
export type Payment = { orderCode: number; kind?: AccountPlan; purpose?: PaymentPurpose; packs?: number; slots?: number; addonSlots?: number; status?: 'PENDING' | 'PAID' | 'FAILED'; qrCode?: string; bin: string; accountNumber: string; accountName: string; amount: number; description: string; expiresAt: string; createdAt?: string; paidAt?: string | null };
export type PaymentStatus = { orderCode: number; status: 'PENDING' | 'PAID' | 'FAILED'; amount: number; paidAt?: string | null };
export type PaymentPage = Payment[] | { content?: Payment[] };

export type QuizKind = 'CLASS_TEST' | 'POST_TEST';
export type Question = {
  id: string;
  externalId?: string | null;
  pool?: string | null;
  stem: string;
  options: string[];
  correctIndex: number;
  standard?: string | null;
  concept?: string | null;
  source?: string | null;
  chapter?: number | null;
  reference?: unknown;
};
export type QuestionInput = { stem: string; options: string[]; correctIndex: number };
export type CreatedQuestionReference = { index: number; id: string; reused: boolean };
export type QuestionPage = Question[] | { items?: Question[] };
export type QuizMode = 'PRACTICE' | 'TEST';
export type QuizWriteInput = {
  title: string;
  questionIds: string[];
  newQuestions?: QuestionInput[];
  dueAt: string;
  mode: QuizMode | null;
  drawCount?: number | null;
  durationMinutes?: number | null;
};
export type QuizSummary = {
  id: string;
  groupId: string;
  kind: QuizKind;
  chapter: number | null;
  title: string;
  questionCount: number;
  dueAt: string | null;
  publishedAt: string | null;
  submittedCount: number;
  mode?: QuizMode | null;
  drawCount?: number | null;
  durationSeconds?: number | null;
};
export type QuizDetail = { quiz: QuizSummary; questions: Question[] };
export type QuizResultRow = {
  slotId: string;
  code: string | null;
  displayName: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'WIPED';
  attempted: boolean;
  score: number | null;
  totalQuestions: number;
  submittedAt: string | null;
};
export type QuizResults = {
  quiz: QuizSummary;
  summary: { assigned: number; submitted: number; averageScore: number | null };
  rows: QuizResultRow[];
};
export type QuizSlotResult = {
  answers: { questionId: string; stem: string; correct: boolean }[];
};

export type LearnerIndicators = {
  wealth: number;
  saving: number;
  happiness: number;
  risk: number;
  goal: number;
};

export type ReportGenerationStatus = 'WAITING_POST_TEST' | 'GENERATING' | 'READY' | 'FALLBACK';
export type ReportSummaryText = { status: ReportGenerationStatus; text?: string | null };
export type ReportRatio = { correct?: number; total?: number };
export type ReportChoice = { sceneId?: string | null; optionId?: string | null; label?: string | null; deliberate?: boolean | null };
export type ReportWrongItem = { gameId?: string | null; itemId?: string | null; concept?: string | null; chosen?: string | null; label?: string | null; chosenLabel?: string | null; expected?: string | null; expectedLabel?: string | null; explanation?: string | null };
export type ChapterReport = {
  chapter?: number; chapterNumber?: number; title?: string; reportStatus?: string;
  summary?: ReportSummaryText | null; choices?: ReportChoice[]; deliberate?: ReportChoice[];
  miniGames?: ReportRatio & { wrong?: ReportWrongItem[] };
  postTest?: ReportRatio & { status?: string };
};
export type ConceptReport = { concept?: string; name?: string; objective?: string; band?: 'NO_DATA' | 'PRACTICE' | 'FAMILIAR' | 'GOOD' | string; correct?: number; total?: number; game?: ReportRatio; postTest?: ReportRatio };
export type FinalReport = { status?: 'NONE' | 'PARTIAL' | 'COMPLETE'; summary?: ReportSummaryText | null };

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
  concepts: ConceptReport[];
  chapters: ChapterReport[];
  finalReport?: FinalReport | null;
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
