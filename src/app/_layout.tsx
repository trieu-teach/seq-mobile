import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";
import { getDevicePushToken } from "@/features/notifications/push-notifications";
import { colors } from "@/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Lấy token FCM và in ra log để bàn giao cho BE.
 *
 * TODO: khi BE có `POST /api/device-tokens`, đổi `console.log` thành gọi API đó
 * (gửi lại mỗi lần app mở và mỗi lần token đổi).
 */
function usePushToken() {
  useEffect(() => {
    let cancelled = false;

    getDevicePushToken()
      .then((token) => {
        if (!cancelled) console.log("[push] FCM token:", token);
      })
      .catch((error) => console.warn("[push] không lấy được token:", error));

    const subscription = Notifications.addPushTokenListener(({ data }) => {
      console.log("[push] FCM token mới:", String(data));
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Fraunces_700Bold });
  usePushToken();
  if (!fontsLoaded && !fontError) return null;
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
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
        <Stack.Screen name="quiz/edit" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="quiz/questions" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="change-password" options={{ animation: "slide_from_right" }} />
      </Stack.Protected>
    </Stack>
  );
}
