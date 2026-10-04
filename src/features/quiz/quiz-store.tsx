import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import { starterQuizzes } from './data';
import type { Quiz, QuizDraft } from './types';

type QuizStoreValue = {
  quizzes: Quiz[];
  getQuiz: (id: string) => Quiz | undefined;
  saveQuiz: (draft: QuizDraft, id?: string) => string;
};

const QuizStoreContext = createContext<QuizStoreValue | null>(null);

export function QuizStoreProvider({ children }: PropsWithChildren) {
  const [quizzes, setQuizzes] = useState(starterQuizzes);

  const value = useMemo<QuizStoreValue>(() => ({
    quizzes,
    getQuiz: (id) => quizzes.find((quiz) => quiz.id === id),
    saveQuiz: (draft, id) => {
      const quizId = id ?? `quiz-${Date.now()}`;
      const quiz: Quiz = { ...draft, id: quizId, updatedAt: new Date().toISOString() };
      setQuizzes((current) => {
        const exists = current.some((item) => item.id === quizId);
        return exists
          ? current.map((item) => item.id === quizId ? quiz : item)
          : [quiz, ...current];
      });
      return quizId;
    },
  }), [quizzes]);

  return <QuizStoreContext.Provider value={value}>{children}</QuizStoreContext.Provider>;
}

export function useQuizStore() {
  const value = useContext(QuizStoreContext);
  if (!value) throw new Error('useQuizStore must be used inside QuizStoreProvider');
  return value;
}
