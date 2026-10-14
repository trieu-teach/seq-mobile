const DEFAULT_API_BASE_URL = 'https://kidzeconomy.com.vn/finteen';

export const apiConfig = {
  baseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, ''),
  timeoutMs: 20_000,
} as const;
