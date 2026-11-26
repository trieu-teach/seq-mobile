import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

/**
 * Bấm vào tin push thì mở đúng màn hình.
 *
 * BE gửi `data.actionType` + `resourceId` (xem NotificationServiceImpl bên do-an-BE):
 * - OPEN_LEARNER_REPORT · resourceId = slotId  -> màn báo cáo của bé
 * - OPEN_QUIZ_RESULTS   · resourceId = quizId  -> màn bài kiểm tra (mở sẵn kết quả)
 * - OPEN_LEARNER_LIST / OPEN_GROUP_REPORT     -> màn quản lý học sinh, chọn đúng lớp
 *
 * Không có data (tin cũ / tin lạ) thì về màn hình chính, không làm app lỗi.
 */
export function notificationTarget(data: Record<string, unknown> | undefined) {
  if (!data) return null;
  const action = typeof data.actionType === 'string' ? data.actionType : '';
  const resourceId = typeof data.resourceId === 'string' ? data.resourceId : null;

  switch (action) {
    case 'OPEN_LEARNER_REPORT':
      return resourceId
        ? { pathname: '/learner/[id]', params: { id: resourceId } }
        : { pathname: '/(tabs)/journey' };
    case 'OPEN_QUIZ_RESULTS':
      return { pathname: '/(tabs)/quiz', params: resourceId ? { quizId: resourceId } : {} };
    case 'OPEN_LEARNER_LIST':
    case 'OPEN_GROUP_REPORT':
      return { pathname: '/(tabs)/journey', params: resourceId ? { groupId: resourceId } : {} };
    default:
      return { pathname: '/(tabs)' };
  }
}

/**
 * Đăng ký listener ngay từ lúc app khởi động, nhưng chỉ điều hướng khi đã có phiên đăng nhập.
 *
 * Trường hợp khó nhất là bấm tin lúc app đã bị kill: lúc đó listener chưa kịp đăng ký, phải hỏi
 * `getLastNotificationResponseAsync()`. Tin có thể trả lại ở cả hai đường nên cần chặn trùng bằng
 * identifier của thông báo.
 */
export function useNotificationNavigation(ready: boolean) {
  const queued = useRef<Notifications.NotificationResponse | null>(null);
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const flush = () => {
      const response = queued.current;
      if (!response) return;
      queued.current = null;

      const request = response.notification.request;
      const key = request.identifier || String(response.notification.date);
      if (handled.current === key) return;
      handled.current = key;

      const target = notificationTarget(request.content.data);
      if (target) router.push(target as never);
    };

    const onResponse = (response: Notifications.NotificationResponse) => {
      queued.current = response;
      if (ready) flush();
    };

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) onResponse(response);
      })
      .catch((error) => console.warn('[push] không đọc được tin đã bấm:', error));

    const subscription = Notifications.addNotificationResponseReceivedListener(onResponse);
    return () => subscription.remove();
  }, [ready]);
}
