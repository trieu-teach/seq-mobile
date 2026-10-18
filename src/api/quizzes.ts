import { apiRequest } from './client';
import type { Question, QuizDetail, QuizResults, QuizSummary } from './types';

const idPath = (id: string) => encodeURIComponent(id);

export const quizzesApi = {
  questions: (filters: { q?: string; standard?: string; concept?: string; pool?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) params.set(key, value.trim());
    });
    const query = params.toString();
    return apiRequest<Question[]>(`/api/questions${query ? `?${query}` : ''}`, { authenticated: true });
  },
  list: (groupId: string) => apiRequest<QuizSummary[]>(`/api/quizzes?groupId=${idPath(groupId)}`, { authenticated: true }),
  get: (quizId: string) => apiRequest<QuizDetail>(`/api/quizzes/${idPath(quizId)}`, { authenticated: true }),
  create: (input: { groupId: string; title: string; questionIds: string[]; dueAt: string }) =>
    apiRequest<QuizSummary>('/api/quizzes', { authenticated: true, body: { ...input, title: input.title.trim() } }),
  update: (quizId: string, input: { title: string; questionIds: string[]; dueAt: string }) =>
    apiRequest<QuizSummary>(`/api/quizzes/${idPath(quizId)}`, { authenticated: true, method: 'PUT', body: { ...input, title: input.title.trim() } }),
  remove: (quizId: string) => apiRequest<void>(`/api/quizzes/${idPath(quizId)}`, { authenticated: true, method: 'DELETE' }),
  publish: (quizId: string) => apiRequest<QuizSummary>(`/api/quizzes/${idPath(quizId)}/publish`, { authenticated: true, method: 'POST' }),
  results: (quizId: string) => apiRequest<QuizResults>(`/api/quizzes/${idPath(quizId)}/results`, { authenticated: true }),
};
