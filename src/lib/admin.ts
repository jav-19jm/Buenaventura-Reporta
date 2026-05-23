import { supabase } from '../app/supabase/supabase';

// ==========================================
// SERVICIOS DE ADMINISTRACIÓN
// ==========================================

/**
 * Obtener todos los usuarios (perfiles)
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Actualizar estado de un usuario
 */
export async function updateUserStatus(userId: string, estado: 'activo' | 'inactivo' | 'suspendido') {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ estado })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al actualizar estado de usuario:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener todas las entidades
 */
export async function getAllEntities() {
  try {
    const { data, error } = await supabase
      .from('entidades')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener entidades:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Crear nueva entidad
 */
export async function createEntity(entity: any) {
  try {
    const { data, error } = await supabase
      .from('entidades')
      .insert([entity])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al crear entidad:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Actualizar entidad
 */
export async function updateEntity(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('entidades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al actualizar entidad:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Eliminar entidad
 */
export async function deleteEntity(id: string) {
  try {
    const { error } = await supabase
      .from('entidades')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al eliminar entidad:', error);
    return { error: error.message };
  }
}

/**
 * Obtener todas las noticias
 */
export async function getAllNews() {
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('*, entidades(nombre)')
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener noticias:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Crear nueva noticia
 */
export async function createNews(news: any) {
  try {
    const { data, error } = await supabase
      .from('noticias')
      .insert([news])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al crear noticia:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Actualizar noticia
 */
export async function updateNews(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('noticias')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al actualizar noticia:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Eliminar noticia
 */
export async function deleteNews(id: string) {
  try {
    const { error } = await supabase
      .from('noticias')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al eliminar noticia:', error);
    return { error: error.message };
  }
}

/**
 * Publicar/Despublicar noticia
 */
export async function togglePublishNews(id: string, esta_publicada: boolean) {
  try {
    const updates: any = { esta_publicada };
    if (esta_publicada) {
      updates.fecha_publicacion = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('noticias')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al publicar noticia:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Asignar reporte a una entidad
 */
export async function assignReportEntity(reportId: string, id_entidad: string) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .update({ id_entidad })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al asignar entidad:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Eliminar reporte (Admin)
 */
export async function deleteReportAdmin(reportId: string) {
  try {
    const { error } = await supabase
      .from('reportes')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al eliminar reporte (admin):', error);
    return { error: error.message };
  }
}

/**
 * Agregar comentario de seguimiento (Admin)
 */
export async function addAdminComment(reportId: string, mensaje: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('mensajes')
      .insert([{
        id_reporte: reportId,
        id_remitente: user?.id,
        tipo_remitente: 'moderador',
        mensaje
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al agregar comentario:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener estadísticas globales para el dashboard
 */
export async function getAdminStats() {
  try {
    // Reportes por estado
    const { data: reports } = await supabase.from('reportes').select('estado, categoria');
    
    // Usuarios por estado
    const { data: users } = await supabase.from('perfiles').select('estado');
    
    // Conteo de entidades
    const { count: entitiesCount } = await supabase.from('entidades').select('*', { count: 'exact', head: true });

    const stats = {
      reports: {
        total: reports?.length || 0,
        byStatus: countByProperty(reports || [], 'estado'),
        byCategory: countByProperty(reports || [], 'categoria')
      },
      users: {
        total: users?.length || 0,
        byStatus: countByProperty(users || [], 'estado')
      },
      entities: entitiesCount || 0
    };

    return { data: stats, error: null };
  } catch (error: any) {
    console.error('Error al obtener estadísticas de admin:', error);
    return { data: null, error: error.message };
  }
}

// Función auxiliar para contar por propiedad
function countByProperty(arr: any[], prop: string) {
  return arr.reduce((acc: any, obj: any) => {
    const key = obj[prop] || 'Sin asignar';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}
