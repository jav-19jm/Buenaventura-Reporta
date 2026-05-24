import { supabase } from '../app/supabase/supabase';
import type { Report, ReportStatus, ReportPriority } from '../app/supabase/supabase';

// ==========================================
// CRUD DE REPORTES CON SUPABASE
// ==========================================

/**
 * Crear nuevo reporte
 */
export async function createReport(reportData: {
  title: string;
  description: string;
  category: string;
  location_address: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  priority?: ReportPriority;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          user_id: user.id,
          ...reportData,
          status: 'pendiente',
          priority: reportData.priority || 'media'
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
      .from('reports')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        ),
        entities:entity_id (
          name,
          slug,
          color
        )
      `)
      .order('created_at', { ascending: false });

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
      .from('reports')
      .select(`
        *,
        entities:entity_id (
          name,
          slug,
          color
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

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
      .from('reports')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          phone,
          avatar_url
        ),
        entities:entity_id (
          name,
          slug,
          color,
          email,
          phone
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
export async function updateReportStatus(reportId: string, status: ReportStatus) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .update({
        status,
        ...(status === 'resuelto' ? { resolved_at: new Date().toISOString() } : {})
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Estado actualizado:', status);
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
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', user.id);

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
export async function voteReport(reportId: string, voteType: 'upvote' | 'downvote') {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    // Verificar si ya votó
    const { data: existingVote } = await supabase
      .from('report_votes')
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      // Actualizar voto existente
      const { error } = await supabase
        .from('report_votes')
        .update({ vote_type: voteType })
        .eq('report_id', reportId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Crear nuevo voto
      const { error } = await supabase
        .from('report_votes')
        .insert([
          {
            report_id: reportId,
            user_id: user.id,
            vote_type: voteType
          }
        ]);

      if (error) throw error;
    }

    console.log('✅ Voto registrado:', voteType);
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
