import { supabase } from '../app/supabase/supabase';
import type { Reporte, EstadoReporte, PrioridadReporte } from '../app/supabase/supabase';

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
          estado: 'pendiente',
          prioridad: reportData.prioridad || 'media'
        }
      ])
      .select()
      .single();

    if (error) throw error;

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
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Estado actualizado:', estado);
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
      .delete()
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

    // Verificar si ya votó
    const { data: existingVote } = await supabase
      .from('votos_reportes')
      .select('*')
      .eq('id_reporte', reportId)
      .eq('id_usuario', user.id)
      .single();

    if (existingVote) {
      // Actualizar voto existente
      const { error } = await supabase
        .from('votos_reportes')
        .update({ tipo_voto: tipoVoto })
        .eq('id_reporte', reportId)
        .eq('id_usuario', user.id);

      if (error) throw error;
    } else {
      // Crear nuevo voto
      const { error } = await supabase
        .from('votos_reportes')
        .insert([
          {
            id_reporte: reportId,
            id_usuario: user.id,
            tipo_voto: tipoVoto
          }
        ]);

      if (error) throw error;
    }

    console.log('✅ Voto registrado:', tipoVoto);
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

    console.log('✅ Imagen subida:', data.publicUrl);
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
          url_avatar
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
export async function createReportMessage(reporteId: string, mensaje: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('mensajes')
      .insert([
        {
          id_reporte: reporteId,
          id_remitente: user.id,
          tipo_remitente: 'usuario',
          mensaje
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al crear mensaje:', error);
    return { data: null, error: error.message };
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
