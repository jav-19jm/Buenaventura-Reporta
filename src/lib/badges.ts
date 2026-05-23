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

    // Obtener badges del usuario
    const { data: userBadges } = await getUserBadges(userId);
    const userBadgeIds = userBadges?.map(b => b.id_insignia) || [];

    // Obtener todas las insignias
    const { data: allBadges } = await getAllBadges();

    if (!allBadges) {
      return { error: 'No se pudieron obtener insignias' };
    }

    const badgesToGrant = [];

    // Verificar condiciones para cada insignia
    // 1. Primer Reporte
    if (user.reportes_creados >= 1 && !userBadgeIds.includes(allBadges[0]?.id)) {
      const badgeId = allBadges.find(b => b.nombre === 'Primer Reporte')?.id;
      if (badgeId) badgesToGrant.push(badgeId);
    }

    // 2. 10 Reportes
    if (user.reportes_creados >= 10 && !userBadgeIds.includes(allBadges[1]?.id)) {
      const badgeId = allBadges.find(b => b.nombre === '10 Reportes')?.id;
      if (badgeId) badgesToGrant.push(badgeId);
    }

    // 3. Solucionador
    if (user.reportes_resueltos >= 1 && !userBadgeIds.includes(allBadges[2]?.id)) {
      const badgeId = allBadges.find(b => b.nombre === 'Solucionador')?.id;
      if (badgeId) badgesToGrant.push(badgeId);
    }

    // 4. 50 Reportes
    if (user.reportes_creados >= 50 && !userBadgeIds.includes(allBadges[3]?.id)) {
      const badgeId = allBadges.find(b => b.nombre === '50 Reportes')?.id;
      if (badgeId) badgesToGrant.push(badgeId);
    }

    // 5. Embajador
    if (user.puntuacion_reputacion > 1000 && !userBadgeIds.includes(allBadges[4]?.id)) {
      const badgeId = allBadges.find(b => b.nombre === 'Embajador')?.id;
      if (badgeId) badgesToGrant.push(badgeId);
    }

    // Otorgar insignias
    for (const badgeId of badgesToGrant) {
      await grantBadgeToUser(userId, badgeId);
    }

    console.log(`✅ Se otorgaron ${badgesToGrant.length} insignias`);
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
