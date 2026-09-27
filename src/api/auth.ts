import { NOT_MIGRATED, pendingRead, pendingWrite, setToken, type ApiResult } from './client';
import type { Perfil } from '../types';

// ==========================================
// AUTENTICACIÓN
// Cada función indica el comportamiento que debe cubrir el backend.
// ==========================================

export type AuthSession = { token: string; user: Perfil };

/**
 * Registrar ciudadano. POST /auth/register { nombre_completo, email, password }
 * El backend crea el usuario y su perfil con rol 'ciudadano' (nunca desde el cliente).
 */
export async function signUp(_email: string, _password: string, _fullName: string): Promise<ApiResult<{ user: Perfil }>> {
  return pendingWrite();
}

/**
 * Iniciar sesión. POST /auth/login { email, password } -> { token, user }
 * Debe rechazar cuentas con estado distinto de 'activo' indicando motivo_bloqueo.
 */
export async function signIn(_email: string, _password: string): Promise<ApiResult<AuthSession>> {
  return pendingWrite();
}

/** Cerrar sesión. POST /auth/logout (revoca el token) */
export async function signOut(): Promise<{ error: string | null }> {
  setToken(null);
  return { error: null };
}

/** Usuario autenticado + perfil. GET /auth/me */
export async function getMe(): Promise<ApiResult<Perfil>> {
  return pendingRead<Perfil>();
}

/** Perfil público de un usuario. GET /users/{id} */
export async function getUserProfile(_userId: string): Promise<ApiResult<Perfil>> {
  return pendingRead<Perfil>();
}

/** Enviar correo de recuperación. POST /auth/forgot-password { email } (enlace a /reset-password?token=...) */
export async function resetPassword(_email: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

/** Cambiar contraseña con el token del correo. POST /auth/reset-password { token, email, password } */
export async function updatePassword(_newPassword: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

/** Subir avatar. POST /users/me/avatar (multipart) -> { url } y actualiza perfiles.url_avatar */
export async function uploadAvatar(_file: File, _userId: string): Promise<{ url: string | null; error: string | null }> {
  return { url: null, error: NOT_MIGRATED };
}
