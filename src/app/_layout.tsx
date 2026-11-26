import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";
import {
  registerDevicePushToken,
  syncDevicePushToken,
} from "@/features/notifications/push-notifications";
import { useNotificationNavigation } from "@/features/notifications/notification-navigation";
import { colors } from "@/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Đăng ký token FCM với BE sau khi đã có phiên đăng nhập (API cần Bearer token).
 *
 * Chạy lại mỗi lần đăng nhập và mỗi lần FCM cấp token mới. Đăng xuất thì
 * auth-context gọi `unregisterDevicePushToken` trước khi xoá phiên.
 */
function usePushRegistration(accessToken: string | null) {
  useEffect(() => {
    if (!accessToken) return;

    registerDevicePushToken().catch((error) =>
      console.warn("[push] không đăng ký được token:", error),
    );

    const subscription = Notifications.addPushTokenListener(({ data }) => {
      syncDevicePushToken(String(data)).catch((error) =>
        console.warn("[push] không cập nhật được token mới:", error),
      );
    });

    return () => subscription.remove();
  }, [accessToken]);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Fraunces_700Bold });
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
  usePushRegistration(session?.accessToken ?? null);
  // Bấm tin lúc app đang chạy hoặc lúc app bị kill: đợi có phiên rồi mới điều hướng.
  useNotificationNavigation(!isLoading && Boolean(session));
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
