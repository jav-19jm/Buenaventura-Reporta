import { supabase } from '../app/supabase/supabase';
import type { Notificacion } from '../app/supabase/supabase';

// ==========================================
// SERVICIO DE NOTIFICACIONES
// ==========================================

/**
 * Obtener las notificaciones de un usuario
 */
export async function getUserNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('id_usuario', userId)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return { data: data as Notificacion[], error: null };
  } catch (error: any) {
    console.error('Error al obtener notificaciones:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Eliminar una notificación
 */
export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al eliminar notificación:', error);
    return { error: error.message };
  }
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notificaciones')
      .update({ esta_leida: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al marcar notificación como leída:', error);
    return { error: error.message };
  }
}
