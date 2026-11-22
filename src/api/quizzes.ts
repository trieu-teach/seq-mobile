import { apiRequest } from './client';
import type { CreatedQuestionReference, Question, QuestionInput, QuestionPage, QuizDetail, QuizResults, QuizSlotResult, QuizSummary, QuizWriteInput } from './types';

const idPath = (id: string) => encodeURIComponent(id);

export const quizzesApi = {
  questions: (filters: { q?: string; standard?: string; concept?: string; pool?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) params.set(key, value.trim());
    });
    const query = params.toString();
    return apiRequest<QuestionPage>(`/api/questions${query ? `?${query}` : ''}`, { authenticated: true });
  },
  myQuestions: (filters: { q?: string; standard?: string; concept?: string; pool?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value?.trim()) params.set(key, value.trim()); });
    const query = params.toString();
    return apiRequest<QuestionPage>(`/api/questions/mine${query ? `?${query}` : ''}`, { authenticated: true });
  },
  createMyQuestions: (questions: QuestionInput[]) => apiRequest<CreatedQuestionReference[]>('/api/questions/mine', { authenticated: true, body: questions }),
  updateMyQuestion: (questionId: string, question: QuestionInput) => apiRequest<Question>(`/api/questions/mine/${idPath(questionId)}`, { authenticated: true, method: 'PUT', body: question }),
  deleteMyQuestion: (questionId: string) => apiRequest<void>(`/api/questions/mine/${idPath(questionId)}`, { authenticated: true, method: 'DELETE' }),
  copyQuestion: (questionId: string) => apiRequest<Question>(`/api/questions/${idPath(questionId)}/copy`, { authenticated: true, method: 'POST' }),
  list: (groupId: string) => apiRequest<QuizSummary[]>(`/api/quizzes?groupId=${idPath(groupId)}`, { authenticated: true }),
  get: (quizId: string) => apiRequest<QuizDetail>(`/api/quizzes/${idPath(quizId)}`, { authenticated: true }),
  create: (input: QuizWriteInput & { groupId: string }) =>
    apiRequest<QuizSummary>('/api/quizzes', { authenticated: true, body: { ...input, title: input.title.trim() } }),
  update: (quizId: string, input: QuizWriteInput) =>
    apiRequest<QuizSummary>(`/api/quizzes/${idPath(quizId)}`, { authenticated: true, method: 'PUT', body: { ...input, title: input.title.trim() } }),
  remove: (quizId: string) => apiRequest<void>(`/api/quizzes/${idPath(quizId)}`, { authenticated: true, method: 'DELETE' }),
  publish: (quizId: string) => apiRequest<QuizSummary>(`/api/quizzes/${idPath(quizId)}/publish`, { authenticated: true, method: 'POST' }),
  results: (quizId: string) => apiRequest<QuizResults>(`/api/quizzes/${idPath(quizId)}/results`, { authenticated: true }),
  slotResult: (quizId: string, slotId: string) =>
    apiRequest<QuizSlotResult>(`/api/quizzes/${idPath(quizId)}/results/${idPath(slotId)}`, { authenticated: true }),
};
