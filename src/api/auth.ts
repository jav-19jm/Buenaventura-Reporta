import { api, setToken, toResult, type ApiResult } from './client';
import type { Perfil } from '../types';

// ==========================================
// AUTENTICACIÓN (JWT contra el backend Laravel)
// ==========================================

export type AuthSession = { token: string; token_type: string; expires_in: number; user: Perfil };

/** Registrar ciudadano. POST /auth/register — la cuenta queda pendiente de verificar el correo */
export async function signUp(email: string, password: string, fullName: string): Promise<ApiResult<{ user: Perfil; message: string }>> {
  return toResult(api.post('/auth/register', { nombre_completo: fullName, email, password }));
}

/**
 * Iniciar sesión. POST /auth/login -> { token, user }
 * Errores con `code`: credenciales_invalidas | correo_no_verificado | cuenta_inactiva
 */
export async function signIn(email: string, password: string): Promise<ApiResult<AuthSession>> {
  return toResult(api.post('/auth/login', { email, password }));
}

/** Cerrar sesión. POST /auth/logout invalida el token en el servidor; localmente se descarta siempre */
export async function signOut(): Promise<{ error: string | null }> {
  await toResult(api.post('/auth/logout'));
  setToken(null);
  return { error: null };
}

/** Usuario autenticado con su perfil. GET /auth/me */
export async function getMe(): Promise<ApiResult<Perfil>> {
  return toResult(api.get('/auth/me'));
}

/** Reenviar el correo de confirmación de cuenta. POST /auth/email/resend */
export async function resendVerificationEmail(email: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.post('/auth/email/resend', { email }));
  return { error };
}

/** Enviar correo de recuperación. POST /auth/forgot-password (enlace a /reset-password?token=...&email=...) */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.post('/auth/forgot-password', { email }));
  return { error };
}

/** Cambiar la contraseña con el token recibido por correo. POST /auth/reset-password */
export async function updatePassword(token: string, email: string, newPassword: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.post('/auth/reset-password', { token, email, password: newPassword }));
  return { error };
}

// ==========================================
// PERFIL
// ==========================================

/**
 * GET /users/{id} — el propio usuario recibe su perfil completo; para los demás
 * solo llegan los datos públicos (sin correo ni teléfono).
 */
export async function getUserProfile(userId: string): Promise<ApiResult<Perfil>> {
  return toResult(api.get(`/users/${userId}`));
}

/** POST /users/me/avatar (multipart) -> { url, user } */
export async function uploadAvatar(file: File, _userId: string): Promise<{ url: string | null; error: string | null }> {
  const form = new FormData();
  form.append('avatar', file);

  const { data, error } = await toResult<{ url: string }>(api.post('/users/me/avatar', form));
  return { url: data?.url ?? null, error };
}
