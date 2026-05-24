import { supabase } from "../app/supabase/supabase";
import type { Entidad, Reporte } from "../app/supabase/supabase";
import { checkAndGrantBadges } from "./badges";

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
        perfil:id_usuario(nombre_completo, email)
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
    const { data, error } = await supabase
      .from("reportes")
      .update({ estado, fecha_actualizacion: new Date().toISOString() })
      .eq("id", reportId)
      .select()
      .single();

    if (!error && data && data.id_usuario) {
      // Si se resolvió, incrementar contador en el perfil del usuario
      if (estado === "resuelto") {
        const { data: profile } = await supabase
          .from("perfiles")
          .select("reportes_resueltos")
          .eq("id", data.id_usuario)
          .single();
        
        if (profile) {
          await supabase
            .from("perfiles")
            .update({ reportes_resueltos: (profile.reportes_resueltos || 0) + 1 })
            .eq("id", data.id_usuario);
        }
      }
      
      // Verificar insignias automáticamente
      await checkAndGrantBadges(data.id_usuario);
    }

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}
