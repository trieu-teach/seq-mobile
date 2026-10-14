import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";
import { QuizStoreProvider } from "@/features/quiz/quiz-store";
import { colors } from "@/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Fraunces_700Bold });
  if (!fontsLoaded && !fontError) return null;
  return (
    <AuthProvider>
      <QuizStoreProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </QuizStoreProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { isLoading, session } = useAuth();
  if (isLoading) return null;
  SplashScreen.hide();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen
          name="login"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen name="register" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="forgot-password" options={{ animation: "slide_from_right" }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session?.account.plans.length)}>
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session && session.account.plans.length === 0)}>
        <Stack.Screen name="guest" options={{ animation: "fade" }} />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="subscribe" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen
          name="learner/[id]"
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="quiz/create"
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="change-password" options={{ animation: "slide_from_right" }} />
      </Stack.Protected>
    </Stack>
  );
}
