import { useState, useEffect } from 'react';
import { supabase } from '../app/supabase/supabase';
import { getCurrentUser, getSession, onAuthStateChange } from '../lib/auth';
import type { Perfil } from '../app/supabase/supabase';

// ==========================================
// HOOK PERSONALIZADO PARA AUTENTICACIÓN
// ==========================================

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Obtener sesión inicial
    getSession().then(({ session }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Obtener perfil del usuario
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios en autenticación
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setLoading(true);
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Verificar si el usuario está bloqueado o suspendido
      if (data.estado !== 'activo') {
        const { toast } = await import('sonner');
        const motive = data.motivo_bloqueo || 'No se especificó un motivo.';
        const statusLabel = data.estado === 'suspendido' ? 'suspendida' : 'bloqueada';
        
        toast.error(`Cuenta ${statusLabel}`, {
          description: `${motive}. Si crees que es un error, contacta a los administradores.`,
          duration: 6000,
        });

        // Cerrar sesión automáticamente
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.rol === 'administrador',
    isEntity: profile?.rol === 'entidad',
    isCitizen: profile?.rol === 'ciudadano',
  };
}
