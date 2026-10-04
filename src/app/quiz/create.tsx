import { router } from "expo-router";
import { QuizForm } from "@/features/quiz/quiz-form";
import { useQuizStore } from "@/features/quiz/quiz-store";
export default function CreateQuizScreen() {
  const { saveQuiz } = useQuizStore();
  return (
    <QuizForm
      onCancel={() => router.back()}
      onSubmit={(draft) => {
        saveQuiz(draft);
        router.replace("/(tabs)/quiz");
      }}
    />
  );
}
