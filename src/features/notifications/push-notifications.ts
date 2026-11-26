import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { deviceTokenApi } from "@/api/device-tokens";

/**
 * Kênh thông báo Android. Phải trùng `channel_id` mà BE gửi
 * (`PushService.ANDROID_CHANNEL_ID` bên do-an-BE); lệch tên là Android 8+ bỏ tin.
 */
export const PUSH_CHANNEL_ID = "default";

/** Token đã đăng ký với BE, giữ lại để xoá đúng dòng khi đăng xuất. */
let cachedToken: string | null = null;

/**
 * App đang mở thì tin vẫn phải hiện. Không đặt handler này, Android chỉ rung ở
 * notification tray còn banner trong app thì không có.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Lấy token FCM của máy này (native token, không phải Expo push token) để BE gửi
 * trực tiếp qua Firebase Admin SDK.
 *
 * Android 13+ chỉ hiện hộp thoại xin quyền sau khi đã có ít nhất một channel, và
 * `getDevicePushTokenAsync` cũng cần channel tồn tại trước — nên tạo channel trước.
 *
 * Trả null khi người dùng từ chối quyền hoặc máy không có Google Play Services.
 */
export async function getDevicePushToken(): Promise<string | null> {
  if (Platform.OS !== "android") {
    return null;
  }

  await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_ID, {
    name: "Thông báo học tập",
    importance: Notifications.AndroidImportance.HIGH,
  });

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== "granted") {
    return null;
  }

  const { data } = await Notifications.getDevicePushTokenAsync();
  return data ? String(data) : null;
}

/**
 * Lấy token và gửi lên BE. Chỉ gọi khi đã đăng nhập (API cần Bearer token); lỗi
 * mạng để chỗ gọi log, không chặn màn hình.
 */
export async function registerDevicePushToken(): Promise<void> {
  const token = await getDevicePushToken();
  if (!token) return;
  cachedToken = token;
  await deviceTokenApi.register(token);
}

/** FCM cấp token mới: gửi ngay để BE cập nhật dòng của máy này. */
export async function syncDevicePushToken(token: string): Promise<void> {
  if (!token) return;
  cachedToken = token;
  await deviceTokenApi.register(token);
}

/**
 * Đăng xuất: xoá token của máy này khỏi BE để không nhận tin của tài khoản cũ.
 * Không có token thì thôi; lỗi mạng chỉ log (lần đăng nhập sau token sẽ đổi chủ).
 */
export async function unregisterDevicePushToken(): Promise<void> {
  const token = cachedToken;
  cachedToken = null;
  if (!token) return;
  try {
    await deviceTokenApi.unregister(token);
  } catch (error) {
    console.warn("[push] không xoá được token khỏi BE:", error);
  }
}
