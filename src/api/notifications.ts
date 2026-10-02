import { api, toResult, type ApiResult } from './client';
import type { Notificacion } from '../types';

// ==========================================
// NOTIFICACIONES
// Pendiente: tiempo real (Laravel Reverb / broadcasting); por ahora la campana consulta cada 30 s.
// ==========================================

/** GET /users/me/notifications — del usuario autenticado, más recientes primero */
export async function getUserNotifications(_userId: string): Promise<ApiResult<Notificacion[]>> {
  return toResult(api.get('/users/me/notifications'));
}

/** DELETE /notifications/{id} — solo el dueño */
export async function deleteNotification(notificationId: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.delete(`/notifications/${notificationId}`));
  return { error };
}

/** PATCH /notifications/{id}/read */
export async function markNotificationAsRead(notificationId: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.patch(`/notifications/${notificationId}/read`));
  return { error };
}

/**
 * POST /users/{id}/report-abuse { motivo, id_reporte } — denuncia a un usuario;
 * el backend notifica a todos los administradores.
 */
export async function reportUserToAdmins(userId: string, reportId: string | null, reason: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.post(`/users/${userId}/report-abuse`, { motivo: reason, id_reporte: reportId }));
  return { error };
}
