import { apiConfig } from './config';

type ApiEnvelope<T> = { code: number; message?: string; result: T };
type RequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown; authenticated?: boolean };
let accessToken: string | null = null;

export class ApiError extends Error {
  constructor(message: string, public readonly code: number | null = null, public readonly status = 0) {
    super(message);
    this.name = 'ApiError';
  }
}
export function setApiAccessToken(token: string | null) { accessToken = token; }

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, authenticated = false } = options;
  const method = options.method ?? (body === undefined ? 'GET' : 'POST');
  if (authenticated && !accessToken) throw new ApiError('Vui lòng đăng nhập lại.', 3003, 401);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), apiConfig.timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${apiConfig.baseUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(authenticated ? { Authorization: `Bearer ${accessToken}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.');
  } finally { clearTimeout(timer); }
  let data: ApiEnvelope<T>;
  try { data = (await response.json()) as ApiEnvelope<T>; }
  catch { throw new ApiError('Máy chủ trả dữ liệu không hợp lệ.', null, response.status); }
  if (!response.ok || data.code !== 0) throw new ApiError(data.message || 'Yêu cầu không thành công.', data.code, response.status);
  return data.result;
}
