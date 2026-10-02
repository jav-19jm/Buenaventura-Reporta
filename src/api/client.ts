import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// ==========================================
// CLIENTE HTTP (Axios) HACIA EL BACKEND LARAVEL
// ==========================================

const TOKEN_KEY = 'br_auth_token';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

/** Evento que escucha AuthContext cuando la sesión deja de ser válida (detail: mensaje opcional) */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

function endSession(message?: string) {
  setToken(null);
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: message }));
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
});

// Adjunta el token Bearer (JWT) a cada petición
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rutas de autenticación cuyos 401/403 son respuestas esperadas (credenciales, correo sin verificar...)
const PUBLIC_AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password', '/auth/email/resend'];

// Una sola renovación en curso aunque fallen varias peticiones a la vez
let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const { data } = await axios.post<{ token: string }>(`${API_URL}/auth/refresh`, null, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    setToken(data.token);
    return data.token;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; codigo?: string }>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (!original || PUBLIC_AUTH_ROUTES.includes(original.url ?? '')) {
      return Promise.reject(error);
    }

    // Token expirado: se renueva una vez y se repite la petición original
    if (status === 401 && !original._retry && getToken()) {
      original._retry = true;
      refreshing ??= refreshToken().finally(() => {
        refreshing = null;
      });

      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    if (status === 401) {
      endSession();
    } else if (status === 403 && error.response?.data?.codigo === 'cuenta_inactiva') {
      // La cuenta fue suspendida mientras la sesión estaba abierta
      endSession(error.response.data.message);
    }

    return Promise.reject(error);
  }
);

// ==========================================
// CONTRATO DE RESPUESTA USADO POR LA UI
// ==========================================

/** `code` es el campo "codigo" que envía el backend en algunos errores (p. ej. correo_no_verificado) */
export type ApiResult<T> = { data: T | null; error: string | null; code?: string };

type LaravelError = { message?: string; codigo?: string; errors?: Record<string, string[]> };

/** Extrae un mensaje legible de un error de Axios / Laravel */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<LaravelError>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. Intenta de nuevo en unos momentos.';

    // Errores de validación (422): el primer mensaje del primer campo
    const firstFieldError = Object.values(error.response.data?.errors ?? {})[0]?.[0];
    return firstFieldError || error.response.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Error desconocido';
}

/** Ejecuta una petición y la convierte al formato { data, error } que consume la UI */
export async function toResult<T>(request: Promise<{ data: T }>): Promise<ApiResult<T>> {
  try {
    const { data } = await request;
    return { data, error: null };
  } catch (error) {
    const code = axios.isAxiosError<LaravelError>(error) ? error.response?.data?.codigo : undefined;
    return { data: null, error: getErrorMessage(error), code };
  }
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
