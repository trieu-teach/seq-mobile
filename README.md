# SEQ Mobile

Ứng dụng Expo/React Native dành riêng cho hai vai trò người lớn của FinTeen:

- `PARENT`: quản lý nhóm gia đình, hồ sơ trẻ và báo cáo học tập.
- `TEACHER`: quản lý lớp, học sinh, Quiz và báo cáo.

Ứng dụng không cung cấp giao diện Kid và không có chế độ khách dùng dữ liệu mock. Tài khoản đã đăng nhập nhưng chưa có gói vẫn được đưa tới màn giới thiệu gói để kích hoạt quyền Parent hoặc Teacher.

## Chạy dự án

```bash
npm install
npx expo start
```

Các route nằm trong `src/app/`; API client nằm trong `src/api/`.

## Kiểm tra

```bash
npx expo lint
npx tsc --noEmit
```
