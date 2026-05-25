import { supabase } from '../app/supabase/supabase';
import { createNotification } from './notifications';

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
 * Actualizar estado de un usuario (activo, inactivo, suspendido)
 */
export async function updateUserStatus(userId: string, estado: 'activo' | 'inactivo' | 'suspendido', motivo?: string) {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ 
        estado, 
        motivo_bloqueo: motivo || null 
      })
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
 * Actualizar el rol de un usuario
 */
export async function updateUserRole(userId: string, rol: string) {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ rol })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al actualizar rol de usuario:', error);
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

    // NOTIFICACIÓN DE NOTICIA (a todos los ciudadanos)
    const { data: citizens } = await supabase.from('perfiles').select('id').eq('rol', 'ciudadano');
    if (citizens) {
      for (const citizen of citizens) {
        await createNotification({
          id_usuario: citizen.id,
          tipo: 'alerta_sistema',
          titulo: 'Nueva noticia en la ciudad',
          mensaje: news.titulo
        });
      }
    }

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
 * Subir imagen de noticia a Supabase Storage
 */
export async function uploadNewsImage(file: File, newsId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${newsId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage
      .from('news')
      .getPublicUrl(filePath);

    // Actualizar la noticia con la URL de la imagen
    const { error: updateError } = await supabase
      .from('noticias')
      .update({ url_imagen: data.publicUrl })
      .eq('id', newsId);

    if (updateError) {
      console.error('Error al asociar la imagen a la noticia:', updateError);
    }

    console.log('✅ Imagen de noticia subida:', data.publicUrl);
    return { url: data.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error al subir imagen de noticia:', error);
    return { url: null, error: error.message };
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
      .select('*, perfiles:id_usuario(id), entidades:id_entidad(nombre)')
      .single();

    if (error) throw error;

    if (data) {
      // 1. Notificar al ciudadano
      if (data.id_usuario) {
        await createNotification({
          id_usuario: data.id_usuario,
          id_reporte: reportId,
          tipo: 'reporte_actualizado',
          titulo: 'Reporte asignado',
          mensaje: `Tu reporte "${data.titulo}" ha sido asignado a: ${data.entidades?.nombre || 'una entidad institucional'}.`
        });
      }

      // 2. Notificar a los usuarios de la entidad
      const { data: entityUsers } = await supabase
        .from('perfiles')
        .select('id')
        .eq('id_entidad', id_entidad);
      
      if (entityUsers) {
        for (const eu of entityUsers) {
          await createNotification({
            id_usuario: eu.id,
            id_reporte: reportId,
            tipo: 'reporte_actualizado',
            titulo: 'Nuevo reporte asignado',
            mensaje: `Se ha asignado un nuevo reporte a tu entidad: ${data.titulo}`
          });
        }
      }
    }

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
      .update({ visible: false })
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

    // NOTIFICACIÓN (Reutilizando la lógica de reports.ts)
    const { data: report } = await supabase.from('reportes').select('id, titulo, id_usuario, id_entidad').eq('id', reportId).single();
    if (report) {
      // 1. Notificar al ciudadano
      if (report.id_usuario && report.id_usuario !== user?.id) {
        await createNotification({
          id_usuario: report.id_usuario,
          id_reporte: reportId,
          tipo: 'nuevo_mensaje',
          titulo: 'Mensaje de administración',
          mensaje: `Un administrador ha comentado en tu reporte: ${report.titulo}`
        });
      }

      // 2. Notificar a la entidad (si está asignada)
      if (report.id_entidad) {
        const { data: entityUsers } = await supabase.from('perfiles').select('id').eq('id_entidad', report.id_entidad);
        if (entityUsers) {
          for (const eu of entityUsers) {
            if (eu.id !== user?.id) {
              await createNotification({
                id_usuario: eu.id,
                id_reporte: reportId,
                tipo: 'nuevo_mensaje',
                titulo: 'Instrucción de administración',
                mensaje: `El administrador ha dejado un comentario en el reporte: ${report.titulo}`
              });
            }
          }
        }
      }
    }

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

// ==========================================
// GESTIÓN DE SERVICIOS (Puntos de Interés)
// ==========================================

/**
 * Obtener todos los servicios
 */
export async function getAllServices() {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener servicios:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Crear nuevo servicio
 */
export async function createService(service: any) {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .insert([service])
      .select()
      .single();

    if (error) throw error;

    // NOTIFICACIÓN DE SERVICIO (a todos los ciudadanos)
    const { data: citizens } = await supabase.from('perfiles').select('id').eq('rol', 'ciudadano');
    if (citizens) {
      for (const citizen of citizens) {
        await createNotification({
          id_usuario: citizen.id,
          tipo: 'alerta_sistema',
          titulo: 'Nuevo servicio disponible',
          mensaje: `Se ha registrado un nuevo punto de servicio: ${service.nombre}`
        });
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al crear servicio:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Actualizar servicio
 */
export async function updateService(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al actualizar servicio:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Eliminar servicio
 */
export async function deleteService(id: string) {
  try {
    const { error } = await supabase
      .from('servicios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al eliminar servicio:', error);
    return { error: error.message };
  }
}

