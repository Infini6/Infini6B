// Central API Client for CareSync Patient Portal

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Error messages map for standard status codes
const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We couldn\'t find what you\'re looking for.',
  409: 'This information has changed. Please refresh and try again.',
  422: 'The validation failed. Please check your inputs.',
  429: 'Too many requests. Please try again later.',
  500: 'Something went wrong. Please try again later.',
};

// Check if we should use mock local storage adapter
// By default, if the base url matches a local placeholder or if requests fail, we can fall back to mock data
export const isMockMode = () => {
  return localStorage.getItem('caresync_use_mock') !== 'false';
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Request helper
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('caresync_token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const status = response.status;
    let message = ERROR_MESSAGES[status] || 'An unexpected error occurred.';
    
    // In case of 401, clear auth session and trigger redirect
    if (status === 401) {
      localStorage.removeItem('caresync_token');
      localStorage.removeItem('caresync_user');
      window.dispatchEvent(new CustomEvent('caresync-session-expired'));
    }

    throw new ApiError(status, message);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: any) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
