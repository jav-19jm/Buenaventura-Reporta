import { pendingRead, NOT_MIGRATED, type ApiResult } from './client';
import type { Notificacion } from '../types';

// ==========================================
// NOTIFICACIONES
// Cada función indica el comportamiento que debe cubrir el backend.
// Pendiente: tiempo real (Laravel Reverb / broadcasting) para la campana y el chat.
// ==========================================

/** GET /users/me/notifications — más recientes primero */
export async function getUserNotifications(_userId: string): Promise<ApiResult<Notificacion[]>> {
  return pendingRead<Notificacion[]>([]);
}

/** DELETE /notifications/{id} — solo el dueño */
export async function deleteNotification(_notificationId: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

/** PATCH /notifications/{id}/read */
export async function markNotificationAsRead(_notificationId: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

/**
 * POST /users/{id}/report-abuse { id_reporte, motivo } — denuncia a un usuario;
 * el backend genera una notificación alerta_sistema para cada administrador.
 */
export async function reportUserToAdmins(_userId: string, _reportId: string | null, _reason: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}
