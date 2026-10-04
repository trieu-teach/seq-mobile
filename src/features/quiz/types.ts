export type QuizQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctOption: number;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  status: 'draft' | 'ready';
  updatedAt: string;
};

export type QuizDraft = Omit<Quiz, 'id' | 'updatedAt'>;
