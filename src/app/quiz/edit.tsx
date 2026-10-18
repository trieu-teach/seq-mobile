import { useLocalSearchParams } from 'expo-router';
import { QuizForm } from '@/features/quiz/quiz-form';

export default function EditQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <QuizForm quizId={id} />;
}
