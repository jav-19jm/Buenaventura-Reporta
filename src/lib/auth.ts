import { supabase } from '../app/supabase/supabase';
import type { Perfil } from '../app/supabase/supabase';

// ==========================================
// AUTENTICACIÓN CON SUPABASE
// ==========================================

/**
 * Registrar nuevo usuario
 */
export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: fullName,
        },
      },
    });

    if (error) throw error;

    // Crear el perfil manualmente si no hay un trigger configurado (usamos upsert por seguridad)
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('perfiles')
        .upsert([
          {
            id: data.user.id,
            email: email,
            nombre_completo: fullName,
            rol: 'ciudadano',
          }
        ], { onConflict: 'id' });
        
      if (profileError) {
        console.warn('Nota: El perfil ya existe o no se pudo crear:', profileError.message);
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error en registro:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Iniciar sesión
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error en inicio de sesión:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Cerrar sesión
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    return { error: error.message };
  }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;
    return { user, error: null };
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    return { user: null, error: error.message };
  }
}

/**
 * Obtener sesión actual
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;
    return { session, error: null };
  } catch (error: any) {
    console.error('Error al obtener sesión:', error);
    return { session: null, error: error.message };
  }
}

/**
 * Obtener perfil del usuario
 */
export async function getUserProfile(userId: string): Promise<{ profile: Perfil | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    return { profile: null, error: error.message };
  }
}

/**
 * Actualizar perfil del usuario
 */
export async function updateUserProfile(userId: string, updates: Partial<Perfil>) {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Escuchar cambios en la autenticación
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Recuperar contraseña
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al recuperar contraseña:', error);
    return { error: error.message };
  }
}

/**
 * Actualizar contraseña
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error al actualizar contraseña:', error);
    return { error: error.message };
  }
}
