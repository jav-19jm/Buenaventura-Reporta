import { supabase } from "../app/supabase/supabase";
import type { Entidad, Reporte } from "../app/supabase/supabase";
import { checkAndGrantBadges } from "./badges";
import { createNotification } from "./notifications";

/**
 * Obtiene información de una entidad por ID
 */
export async function getEntityById(entityId: string) {
  try {
    const { data, error } = await supabase
      .from("entidades")
      .select("*")
      .eq("id", entityId)
      .single();

    return { data: data as Entidad | null, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Obtiene todos los reportes asignados a una entidad
 */
export async function getEntityReports(entityId: string, category?: string) {
  try {
    let query = supabase
      .from("reportes")
      .select(`
        *,
        perfiles:id_usuario(nombre_completo, email)
      `);

    if (category) {
      // Si hay categoría, buscar reportes de esa categoría O asignados específicamente a esta entidad
      query = query.or(`categoria.eq.${category},id_entidad.eq.${entityId}`);
    } else {
      query = query.eq("id_entidad", entityId);
    }

    const { data, error } = await query.order("fecha_creacion", { ascending: false });

    return { data: data as (Reporte & { perfil: any })[] | null, error };
  } catch (error) {

    return { data: null, error };
  }
}

/**
 * Obtiene reportes asignados a una entidad con estado específico
 */
export async function getEntityReportsByStatus(entityId: string, estado: string) {
  try {
    const { data, error } = await supabase
      .from("reportes")
      .select("*")
      .eq("id_entidad", entityId)
      .eq("estado", estado);

    return { data: data as Reporte[] | null, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Obtiene estadísticas de reportes asignados a una entidad
 */
export async function getEntityStats(entityId: string) {
  try {
    const { data, error } = await supabase
      .from("reportes")
      .select("estado")
      .eq("id_entidad", entityId);

    if (error || !data) return { data: null, error };

    const stats = {
      total: data.length,
      pendiente: data.filter((r: any) => r.estado === "pendiente").length,
      en_revision: data.filter((r: any) => r.estado === "en_revision").length,
      en_proceso: data.filter((r: any) => r.estado === "en_proceso").length,
      resuelto: data.filter((r: any) => r.estado === "resuelto").length,
      cancelado: data.filter((r: any) => r.estado === "cancelado").length,
    };

    return { data: stats, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Obtiene todas las entidades
 */
export async function getAllEntities() {
  try {
    const { data, error } = await supabase
      .from("entidades")
      .select("*")
      .order("nombre", { ascending: true });

    return { data: data as Entidad[] | null, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Actualiza el estado de un reporte
 */
export async function updateReportStatus(reportId: string, estado: string) {
  try {
    // 1. Obtener ID de usuario antes de actualizar (para la reputación)
    const { data: reportBefore } = await supabase
      .from("reportes")
      .select("id_usuario")
      .eq("id", reportId)
      .single();

    // 2. Actualizar estado
    const { data, error } = await supabase
      .from("reportes")
      .update({ 
        estado, 
        fecha_actualizacion: new Date().toISOString(),
        visible: (estado === 'resuelto' || estado === 'cancelado') ? false : true
      })
      .eq("id", reportId)
      .select()
      .single();

    if (error) throw error;

    // NOTIFICACIÓN AL CIUDADANO
    if (data && reportBefore?.id_usuario) {
      await createNotification({
        id_usuario: reportBefore.id_usuario,
        id_reporte: reportId,
        tipo: estado === 'resuelto' ? 'reporte_resuelto' : 'reporte_actualizado',
        titulo: 'Estado de reporte actualizado',
        mensaje: `La entidad ha actualizado tu reporte a: ${estado.replace('_', ' ')}`
      });
    }

    // 3. Si se resolvió...
    if (estado === "resuelto" && reportBefore?.id_usuario) {
      const { data: profile } = await supabase
        .from("perfiles")
        .select("reportes_resueltos")
        .eq("id", reportBefore.id_usuario)
        .single();
      
      if (profile) {
        await supabase
          .from("perfiles")
          .update({ reportes_resueltos: (profile.reportes_resueltos || 0) + 1 })
          .eq("id", reportBefore.id_usuario);
      }
      
      // Verificar insignias automáticamente
      await checkAndGrantBadges(reportBefore.id_usuario);
    }

    return { data: data || null, error: null };
  } catch (error: any) {
    console.error('Error en updateReportStatus:', error);
    return { data: null, error: error.message };
  }
}
/**
 * Actualiza los detalles de una entidad (logo, sitio web, etc.)
 */
export async function updateEntityDetails(entityId: string, updates: Partial<Entidad>) {
  try {
    const { data, error } = await supabase
      .from("entidades")
      .update({
        ...updates,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq("id", entityId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Sube el logo de la entidad al bucket 'logos'
 */
export async function uploadEntityLogo(entityId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${entityId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    // Actualizar la entidad con la URL del logo
    await updateEntityDetails(entityId, { logo_url: data.publicUrl });

    return { url: data.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error al subir logo:', error);
    return { url: null, error: error.message };
  }
}

/**
 * Obtiene el registro de auditoría de una entidad
 */
export async function getEntityActivity(entityId: string) {
  try {
    const { data, error } = await supabase
      .from("actividad_entidades")
      .select("*")
      .eq("id_entidad", entityId)
      .order("fecha_creacion", { ascending: false })
      .limit(50);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Registra una acción manualmente en la auditoría
 */
export async function logEntityActivity(entityId: string, tipoAccion: string, titulo: string, descripcion: string) {
  try {
    const { error } = await supabase
      .from("actividad_entidades")
      .insert({
        id_entidad: entityId,
        tipo_accion: tipoAccion,
        titulo,
        descripcion
      });
    return { error };
  } catch (error) {
    return { error };
  }
}
