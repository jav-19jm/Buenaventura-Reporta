import { supabase } from '../app/supabase/supabase';

// ==========================================
// GESTIÓN DE INSIGNIAS/BADGES
// ==========================================

/**
 * Obtener todas las insignias disponibles
 */
export async function getAllBadges() {
  try {
    const { data, error } = await supabase
      .from('insignias')
      .select('*')
      .order('nombre');

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener insignias:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener insignias ganadas por un usuario
 */
export async function getUserBadges(userId: string) {
  try {
    const { data, error } = await supabase
      .from('insignias_usuarios')
      .select(`
        *,
        insignias (
          id,
          nombre,
          descripcion,
          icono,
          requisito_texto
        )
      `)
      .eq('id_usuario', userId)
      .order('fecha_obtencion', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al obtener insignias del usuario:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Otorgar una insignia a un usuario
 */
export async function grantBadgeToUser(userId: string, badgeId: string) {
  try {
    // Verificar si ya la tiene
    const { data: existing } = await supabase
      .from('insignias_usuarios')
      .select('id')
      .eq('id_usuario', userId)
      .eq('id_insignia', badgeId)
      .single();

    if (existing) {
      return { data: existing, error: null };
    }

    // Crear nueva insignia ganada
    const { data, error } = await supabase
      .from('insignias_usuarios')
      .insert([
        {
          id_usuario: userId,
          id_insignia: badgeId
        }
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Insignia otorgada:', badgeId);
    return { data, error: null };
  } catch (error: any) {
    console.error('Error al otorgar insignia:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Verificar y otorgar insignias automáticas basadas en logros
 */
export async function checkAndGrantBadges(userId: string) {
  try {
    // Obtener datos del usuario
    const { profile: user } = await (await import('./auth')).getUserProfile(userId);

    if (!user) {
      return { error: 'Usuario no encontrado' };
    }

    // Obtener badges que ya tiene el usuario
    const { data: userBadges } = await getUserBadges(userId);
    const userBadgeNames = userBadges?.map(b => b.insignias.nombre) || [];

    // Obtener todas las insignias disponibles en el sistema
    const { data: allBadges } = await getAllBadges();

    if (!allBadges) {
      return { error: 'No se pudieron obtener insignias del sistema' };
    }

    const badgesToGrant = [];

    // Lógica de asignación por méritos
    
    // 1. Primer Reporte
    if (user.reportes_creados >= 1 && !userBadgeNames.includes('Primer Reporte')) {
      const badge = allBadges.find(b => b.nombre === 'Primer Reporte');
      if (badge) badgesToGrant.push(badge.id);
    }

    // 2. 10 Reportes
    if (user.reportes_creados >= 10 && !userBadgeNames.includes('10 Reportes')) {
      const badge = allBadges.find(b => b.nombre === '10 Reportes');
      if (badge) badgesToGrant.push(badge.id);
    }

    // 3. 50 Reportes
    if (user.reportes_creados >= 50 && !userBadgeNames.includes('50 Reportes')) {
      const badge = allBadges.find(b => b.nombre === '50 Reportes');
      if (badge) badgesToGrant.push(badge.id);
    }

    // 4. Solucionador (Al menos 1 reporte resuelto)
    if (user.reportes_resueltos >= 1 && !userBadgeNames.includes('Solucionador')) {
      const badge = allBadges.find(b => b.nombre === 'Solucionador');
      if (badge) badgesToGrant.push(badge.id);
    }

    // 5. Embajador (Reputación alta)
    if (user.puntuacion_reputacion >= 100 && !userBadgeNames.includes('Embajador')) {
      const badge = allBadges.find(b => b.nombre === 'Embajador');
      if (badge) badgesToGrant.push(badge.id);
    }

    // Otorgar las insignias ganadas
    for (const badgeId of badgesToGrant) {
      await grantBadgeToUser(userId, badgeId);
    }

    if (badgesToGrant.length > 0) {
      console.log(`✅ Se otorgaron ${badgesToGrant.length} nuevas insignias a ${user.nombre_completo}`);
    }
    
    return { data: badgesToGrant, error: null };
  } catch (error: any) {
    console.error('Error al verificar y otorgar insignias:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Obtener insignias de un usuario con descripción completa
 */
export async function getUserBadgesWithDetails(userId: string) {
  try {
    const { data, error } = await supabase
      .from('insignias_usuarios')
      .select(`
        id,
        fecha_obtencion,
        insignias (
          id,
          nombre,
          descripcion,
          icono,
          requisito_texto
        )
      `)
      .eq('id_usuario', userId)
      .order('fecha_obtencion', { ascending: false });

    if (error) throw error;

    // Transformar estructura
    const formattedData = data?.map(item => ({
      id: item.id,
      fecha_obtencion: item.fecha_obtencion,
      ...item.insignias
    })) || [];

    return { data: formattedData, error: null };
  } catch (error: any) {
    console.error('Error al obtener insignias del usuario:', error);
    return { data: null, error: error.message };
  }
}
