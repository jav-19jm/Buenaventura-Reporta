import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { getToken, setToken } from '../api/client';
import { getMe, signIn, signOut } from '../api/auth';
import type { Perfil } from '../types';

// ==========================================
// CONTEXTO DE AUTENTICACIÓN
// Guarda el perfil del usuario autenticado y expone los permisos por rol.
// ==========================================

export type AuthContextValue = {
  /** Perfil autenticado (id, email, rol...). null si no hay sesión */
  user: Perfil | null;
  profile: Perfil | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEntity: boolean;
  isCitizen: boolean;
  login: (email: string, password: string) => Promise<{ profile: Perfil | null; error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function notifyBlockedAccount(profile: Perfil) {
  const motive = profile.motivo_bloqueo || 'No se especificó un motivo.';
  const statusLabel = profile.estado === 'suspendido' ? 'suspendida' : 'bloqueada';
  toast.error(`Cuenta ${statusLabel}`, {
    description: `${motive}. Si crees que es un error, contacta a los administradores.`,
    duration: 6000,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!getToken()) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await getMe();
    if (data && data.estado !== 'activo') {
      notifyBlockedAccount(data);
      await logout();
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await signIn(email, password);
    if (error || !data) return { profile: null, error: error ?? 'No se pudo iniciar sesión' };

    if (data.user.estado !== 'activo') {
      notifyBlockedAccount(data.user);
      return { profile: null, error: 'Cuenta no activa' };
    }

    setToken(data.token);
    setProfile(data.user);
    return { profile: data.user, error: null };
  }, []);

  useEffect(() => {
    refreshProfile();

    // El interceptor de Axios emite este evento cuando el backend responde 401
    const onExpired = () => setProfile(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: profile,
      profile,
      loading,
      isAuthenticated: !!profile,
      isAdmin: profile?.rol === 'administrador',
      isEntity: profile?.rol === 'entidad',
      isCitizen: profile?.rol === 'ciudadano',
      login,
      logout,
      refreshProfile,
    }),
    [profile, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
