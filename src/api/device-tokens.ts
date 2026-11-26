import { apiRequest } from './client';

/**
 * Token thiết bị nhận push (bảng `device_token` bên BE).
 *
 * Token FCM là duy nhất toàn hệ: đăng ký cùng token cho tài khoản khác thì BE đổi chủ
 * dòng cũ, nên không cần xoá trước khi đăng nhập tài khoản mới.
 */
export const deviceTokenApi = {
  register: (token: string, platform: 'ANDROID' | 'WEB' = 'ANDROID') =>
    apiRequest<{ registered: boolean }>('/api/device-tokens', {
      authenticated: true,
      body: { token, platform },
    }),

  /** Token FCM có dấu `:` và các ký tự khác trong path nên phải encode. */
  unregister: (token: string) =>
    apiRequest<{ removed: boolean }>(`/api/device-tokens/${encodeURIComponent(token)}`, {
      method: 'DELETE',
      authenticated: true,
    }),
};
