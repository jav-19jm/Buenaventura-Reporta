import { supabase } from '../app/supabase/supabase';
import type { Reporte, EstadoReporte, PrioridadReporte } from '../app/supabase/supabase';
import { checkAndGrantBadges } from './badges';
import { createNotification } from './notifications';

// ==========================================
// CRUD DE REPORTES CON SUPABASE (ESPAÑOL)
// ==========================================

/**
 * Crear nuevo reporte
 */
export async function createReport(reportData: {
  titulo: string;
  descripcion: string;
  categoria: string;
  direccion_ubicacion: string;
  latitud?: string;
  longitud?: string;
  url_imagen?: string;
  prioridad?: PrioridadReporte;
  id_entidad?: string | null;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('reportes')
      .insert([
        {
          id_usuario: user.id,
          titulo: reportData.titulo,
          descripcion: reportData.descripcion,
          categoria: reportData.categoria,
          direccion_ubicacion: reportData.direccion_ubicacion,
          latitud: reportData.latitud,
          longitud: reportData.longitud,
          url_imagen: reportData.url_imagen,
          id_entidad: reportData.id_entidad || null,
          estado: 'pendiente',
          prioridad: reportData.prioridad || 'media'
        }
      ])

      .select()
      .single();

    if (error) throw error;

    // Actualizar estadísticas del perfil
    if (data) {
      const { data: profile } = await supabase
        .from('perfiles')
        .select('reportes_creados')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        await supabase
          .from('perfiles')
          .update({ reportes_creados: (profile.reportes_creados || 0) + 1 })
          .eq('id', user.id);
      }
      
      // Verificar insignias automáticamente
      await checkAndGrantBadges(user.id);
    }

    console.log('✅ Reporte creado:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al crear reporte:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener todos los reportes públicos
 */
export async function getPublicReports() {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .select(`
        *,
        perfiles:id_usuario (
          id,
          nombre_completo,
          url_avatar
        ),
        entidades:id_entidad (
          id,
          nombre,
          slug,
          color
        )
      `)
      .eq('visible', true)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    console.log('✅ Reportes cargados:', data?.length);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener todos los reportes (incluyendo invisibles) para administración
 */
export async function getAdminReports() {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .select(`
        *,
        perfiles:id_usuario (
          id,
          nombre_completo,
          url_avatar
        ),
        entidades:id_entidad (
          id,
          nombre,
          slug,
          color
        )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener reportes administrativos:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener reportes del usuario actual
 */
export async function getUserReports() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('reportes')
      .select(`
        *,
        entidades:id_entidad (
          id,
          nombre,
          slug,
          color
        )
      `)
      .eq('id_usuario', user.id)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    console.log('✅ Mis reportes:', data?.length);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener reportes del usuario:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener un reporte específico por ID
 */
export async function getReportById(reportId: string) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .select(`
        *,
        perfiles:id_usuario (
          id,
          nombre_completo,
          email,
          telefono,
          url_avatar,
          puntuacion_reputacion
        ),
        entidades:id_entidad (
          id,
          nombre,
          slug,
          color,
          email,
          telefono
        )
      `)
      .eq('id', reportId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener reporte:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Actualizar estado de un reporte
 */
export async function updateReportStatus(reportId: string, estado: EstadoReporte) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .update({
        estado,
        fecha_actualizacion: new Date().toISOString(),
        visible: (estado === 'resuelto' || estado === 'cancelado') ? false : true
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Estado actualizado:', estado);

    // NOTIFICACIÓN AL USUARIO
    if (data?.id_usuario) {
      await createNotification({
        id_usuario: data.id_usuario,
        id_reporte: reportId,
        tipo: estado === 'resuelto' ? 'reporte_resuelto' : 'reporte_actualizado',
        titulo: `Tu reporte ha sido actualizado`,
        mensaje: `El estado de tu reporte "${data.titulo}" ha cambiado a: ${estado.replace('_', ' ')}.`
      });
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Eliminar reporte (solo el creador)
 */
export async function deleteReport(reportId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    const { error } = await supabase
      .from('reportes')
      .update({ visible: false })
      .eq('id', reportId)
      .eq('id_usuario', user.id);

    if (error) throw error;

    console.log('✅ Reporte eliminado');
    return { error: null };
  } catch (error: any) {
    console.error('Error al eliminar reporte:', error);
    return { error: error.message };
  }
}

/**
 * Votar en un reporte
 */
export async function voteReport(reportId: string, tipoVoto: 'voto_positivo' | 'voto_negativo') {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    // 1. Obtener el reporte para saber quién es el autor
    const { data: reportData, error: reportError } = await supabase
      .from('reportes')
      .select('id_usuario, votos_positivos, votos_negativos')
      .eq('id', reportId)
      .single();

    if (reportError) throw reportError;

    // 2. Verificar si ya votó
    const { data: existingVote } = await supabase
      .from('votos_reportes')
      .select('*')
      .eq('id_reporte', reportId)
      .eq('id_usuario', user.id)
      .single();

    let reputationChange = 0;
    
    if (existingVote) {
      if (existingVote.tipo_voto === tipoVoto) {
        return { error: 'Ya has votado lo mismo en este reporte' };
      }
      
      // Cambió de opinión (ej: de positivo a negativo)
      reputationChange = tipoVoto === 'voto_positivo' ? 2 : -2;

      const { error } = await supabase
        .from('votos_reportes')
        .update({ tipo_voto: tipoVoto })
        .eq('id', existingVote.id);

      if (error) throw error;
    } else {
      // Voto nuevo
      reputationChange = tipoVoto === 'voto_positivo' ? 1 : -1;

      const { error } = await supabase
        .from('votos_reportes')
        .insert([{
          id_reporte: reportId,
          id_usuario: user.id,
          tipo_voto: tipoVoto
        }]);

      if (error) throw error;
    }

    // 3. Actualizar contadores en la tabla 'reportes'
    const { count: posCount } = await supabase
      .from('votos_reportes')
      .select('*', { count: 'exact', head: true })
      .eq('id_reporte', reportId)
      .eq('tipo_voto', 'voto_positivo');

    const { count: negCount } = await supabase
      .from('votos_reportes')
      .select('*', { count: 'exact', head: true })
      .eq('id_reporte', reportId)
      .eq('tipo_voto', 'voto_negativo');

    await supabase
      .from('reportes')
      .update({
        votos_positivos: posCount || 0,
        votos_negativos: negCount || 0,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', reportId);

    // 4. Actualizar reputación del autor del reporte (en la tabla 'perfiles')
    if (reportData.id_usuario) {
      // Obtener todos los reportes del usuario para recalcular totales
      const { data: allUserReports } = await supabase
        .from('reportes')
        .select('votos_positivos, votos_negativos')
        .eq('id_usuario', reportData.id_usuario);
      
      if (allUserReports) {
        const totalPos = allUserReports.reduce((sum, r) => sum + (r.votos_positivos || 0), 0);
        const totalNeg = allUserReports.reduce((sum, r) => sum + (r.votos_negativos || 0), 0);
        
        await supabase
          .from('perfiles')
          .update({
            votos_positivos: totalPos,
            votos_negativos: totalNeg,
            puntuacion_reputacion: totalPos - totalNeg
          })
          .eq('id', reportData.id_usuario);
      }

      // 5. Verificar insignias por reputación
      await checkAndGrantBadges(reportData.id_usuario);
    }

    console.log('✅ Voto y reputación actualizados:', tipoVoto);

    // NOTIFICACIÓN DE VOTO
    if (reportData.id_usuario && reportData.id_usuario !== user.id) {
      await createNotification({
        id_usuario: reportData.id_usuario,
        id_reporte: reportId,
        tipo: 'mencion',
        titulo: 'Nuevo voto en tu reporte',
        mensaje: `Alguien ha dado un ${tipoVoto === 'voto_positivo' ? 'voto positivo' : 'voto negativo'} a tu reporte.`
      });
    }

    return { error: null };
  } catch (error: any) {
    console.error('Error al votar:', error);
    return { error: error.message };
  }
}

/**
 * Obtener reportes cercanos a una ubicación
 */
export async function getNearbyReports(lat: number, lng: number, radiusMeters: number = 1000) {
  try {
    const { data, error } = await supabase
      .rpc('get_nearby_reports', {
        lat,
        lng,
        radius_meters: radiusMeters
      });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener reportes cercanos:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Subir imagen de reporte a Supabase Storage
 */
export async function uploadReportImage(file: File, reportId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${reportId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage
      .from('report-images')
      .getPublicUrl(filePath);

    // Actualizar el reporte con la URL de la imagen
    const { error: updateError } = await supabase
      .from('reportes')
      .update({ url_imagen: data.publicUrl })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error al asociar la imagen al reporte:', updateError);
    }

    console.log('✅ Imagen subida y enlazada:', data.publicUrl);
    return { url: data.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error al subir imagen:', error);
    return { url: null, error: error.message };
  }
}

/**
 * Obtener reportes por categoría
 */
export async function getReportsByCategory(categoria: string) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .select(`
        *,
        perfiles:id_usuario (
          nombre_completo,
          url_avatar
        )
      `)
      .eq('categoria', categoria)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener reportes por categoría:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener reportes por estado
 */
export async function getReportsByStatus(estado: EstadoReporte) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .select(`
        *,
        perfiles:id_usuario (
          nombre_completo,
          url_avatar
        ),
        entidades:id_entidad (
          nombre,
          color
        )
      `)
      .eq('estado', estado)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener reportes por estado:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener estadísticas de reportes para admin dashboard
 */
export async function getReportStats() {
  try {
    const { data, error: error1 } = await supabase
      .from('reportes')
      .select('id, estado, categoria');

    if (error1) throw error1;

    const stats = {
      total: data?.length || 0,
      byStatus: countByProperty(data || [], 'estado'),
      byCategory: countByProperty(data || [], 'categoria')
    };

    return { data: stats, error: null };
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener mensajes de un reporte
 */
export async function getReportMessages(reporteId: string) {
  try {
    const { data, error } = await supabase
      .from('mensajes')
      .select(`
        *,
        perfiles:id_remitente (
          nombre_completo,
          url_avatar,
          rol
        )
      `)
      .eq('id_reporte', reporteId)
      .order('fecha_creacion', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener mensajes:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Crear mensaje en reporte
 */
export async function createReportMessage(reporteId: string, mensaje: string, tipoRemitente?: 'usuario' | 'entidad' | 'moderador') {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    // Determinar tipo de remitente si no se proporciona
    let finalTipo = tipoRemitente;
    if (!finalTipo) {
      const { data: profile } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
      if (profile?.rol === 'administrador' || profile?.rol === 'moderador') finalTipo = 'moderador';
      else if (profile?.rol === 'entidad') finalTipo = 'entidad';
      else finalTipo = 'usuario';
    }

    const { data, error } = await supabase
      .from('mensajes')
      .insert([
        {
          id_reporte: reporteId,
          id_remitente: user.id,
          tipo_remitente: finalTipo,
          mensaje
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // NOTIFICACIÓN DE MENSAJE
    const { data: report } = await getReportById(reporteId);
    if (report) {
      // 1. Notificar a los Admins
      const { data: adminUsers } = await supabase.from('perfiles').select('id').eq('rol', 'administrador');
      if (adminUsers) {
        for (const admin of adminUsers) {
          if (admin.id !== user.id) {
            await createNotification({
              id_usuario: admin.id,
              id_reporte: reporteId,
              tipo: 'nuevo_mensaje',
              titulo: 'Actividad en reporte',
              mensaje: `Nuevo mensaje de ${finalTipo === 'usuario' ? 'ciudadano' : finalTipo === 'entidad' ? 'entidad' : 'administración'} en: ${report.titulo}`
            });
          }
        }
      }

      // 2. Notificar al ciudadano
      if (report.id_usuario && report.id_usuario !== user.id) {
        const remitenteLabel = finalTipo === 'moderador' ? 'La Administración' : 'La Entidad Responsable';
        await createNotification({
          id_usuario: report.id_usuario,
          id_reporte: reporteId,
          tipo: 'nuevo_mensaje',
          titulo: 'Nueva respuesta institucional',
          mensaje: `${remitenteLabel} ha respondido a tu reporte: ${report.titulo}`
        });
      }

      // 3. Notificar a la entidad responsable
      if (report.id_entidad && finalTipo !== 'entidad') {
        // 1. Obtener el email de la entidad
        const { data: entityData } = await supabase.from('entidades').select('email').eq('id', report.id_entidad).single();
        
        if (entityData?.email) {
          // 2. Buscar usuarios cuyo email coincida con el de la entidad (insensible a mayúsculas)
          const { data: usersByEmail } = await supabase.from('perfiles').select('id').ilike('email', entityData.email);
          
          if (usersByEmail && usersByEmail.length > 0) {
            for (const u of usersByEmail) {
              if (u.id !== user.id) {
                await createNotification({
                  id_usuario: u.id,
                  id_reporte: reporteId,
                  tipo: 'nuevo_mensaje',
                  titulo: 'Nuevo mensaje en reporte asignado',
                  mensaje: `Hay nueva actividad en el reporte: ${report.titulo}`
                });
              }
            }
          }
        }
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al crear mensaje:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Actualizar mensaje (solo dentro de los primeros 5 minutos)
 */
export async function updateReportMessage(mensajeId: string, nuevoMensaje: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuario no autenticado' };

    // Verificar tiempo (5 min = 300000 ms)
    const { data: existingMsg, error: fetchError } = await supabase
      .from('mensajes')
      .select('fecha_creacion, id_remitente')
      .eq('id', mensajeId)
      .single();

    if (fetchError || !existingMsg) throw new Error('Mensaje no encontrado');
    if (existingMsg.id_remitente !== user.id) throw new Error('No tienes permiso para editar este mensaje');

    const diff = Date.now() - new Date(existingMsg.fecha_creacion).getTime();
    if (diff > 5 * 60 * 1000) {
      return { error: 'El tiempo límite de 5 minutos para editar ha expirado' };
    }

    const { data, error } = await supabase
      .from('mensajes')
      .update({ mensaje: nuevoMensaje })
      .eq('id', mensajeId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al actualizar mensaje:', error);
    return { error: error.message };
  }
}

/**
 * Eliminar mensaje (solo dentro de los primeros 5 minutos)
 */
export async function deleteReportMessage(mensajeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Usuario no autenticado' };

    const { data: existingMsg, error: fetchError } = await supabase
      .from('mensajes')
      .select('fecha_creacion, id_remitente')
      .eq('id', mensajeId)
      .single();

    if (fetchError || !existingMsg) throw new Error('Mensaje no encontrado');
    if (existingMsg.id_remitente !== user.id) throw new Error('No tienes permiso para eliminar este mensaje');

    const diff = Date.now() - new Date(existingMsg.fecha_creacion).getTime();
    if (diff > 5 * 60 * 1000) {
      return { error: 'El tiempo límite de 5 minutos para eliminar ha expirado' };
    }

    const { error } = await supabase
      .from('mensajes')
      .delete()
      .eq('id', mensajeId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al eliminar mensaje:', error);
    return { error: error.message };
  }
}

/**
 * Obtener todas las categorías de reportes activas
 */
export async function getReportCategories() {
  try {
    const { data, error } = await supabase
      .from('categorias_reportes')
      .select('*')
      .eq('esta_activa', true)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener categorías:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener noticias publicadas para el panel de usuario
 */
export async function getPublicNews() {
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('*, entidades(nombre)')
      .eq('esta_publicada', true)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener noticias:', error);
    return { data: null, error: error.message };
  }
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Contar occurrencias de una propiedad en un array
 */
function countByProperty(arr: any[], property: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const key = item[property] || 'sin_datos';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}
