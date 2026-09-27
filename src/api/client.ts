import axios, { AxiosError } from 'axios';

// ==========================================
// CLIENTE HTTP (Axios) HACIA EL BACKEND LARAVEL
// ==========================================

const TOKEN_KEY = 'br_auth_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Almacenamiento no disponible (modo privado, etc.)
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
});

// Adjunta el token Bearer (Laravel Sanctum) a cada petición
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el backend responde 401 la sesión ya no es válida: se descarta el token
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setToken(null);
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// ==========================================
// CONTRATO DE RESPUESTA USADO POR LA UI
// ==========================================

export type ApiResult<T> = { data: T | null; error: string | null };

/** Extrae un mensaje legible de un error de Axios / Laravel */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: string } | undefined;
    return body?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Error desconocido';
}

// ==========================================
// STUBS TEMPORALES MIENTRAS SE CONSTRUYE EL BACKEND
// ==========================================

export const NOT_MIGRATED = 'Funcionalidad pendiente de migrar al backend';

/** Lectura aún sin endpoint: devuelve un valor vacío para que la UI muestre su estado vacío */
export function pendingRead<T>(emptyValue: T | null = null): Promise<ApiResult<T>> {
  return Promise.resolve({ data: emptyValue, error: null });
}

/** Escritura aún sin endpoint: devuelve un error explícito para que la UI lo notifique */
export function pendingWrite<T = never>(): Promise<ApiResult<T>> {
  return Promise.resolve({ data: null, error: NOT_MIGRATED });
}
