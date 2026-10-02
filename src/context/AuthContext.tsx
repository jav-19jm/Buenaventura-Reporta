import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { AUTH_EXPIRED_EVENT, getToken, setToken } from '../api/client';
import { getMe, signIn, signOut } from '../api/auth';
import type { Perfil } from '../types';

// ==========================================
// CONTEXTO DE AUTENTICACIÓN
// Guarda el perfil del usuario autenticado y expone los permisos por rol.
// Las reglas (correo verificado, cuenta activa) las valida el backend.
// ==========================================

export type LoginResult = { profile: Perfil | null; error: string | null; code?: string };

export type AuthContextValue = {
  /** Perfil autenticado (id, email, rol...). null si no hay sesión */
  user: Perfil | null;
  profile: Perfil | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEntity: boolean;
  isCitizen: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

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

    // Si el token expiró, el interceptor lo renueva; si la cuenta está bloqueada, cierra la sesión
    const { data } = await getMe();
    setProfile(data);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { data, error, code } = await signIn(email, password);
    if (error || !data) return { profile: null, error: error ?? 'No se pudo iniciar sesión', code };

    setToken(data.token);
    setProfile(data.user);
    return { profile: data.user, error: null };
  }, []);

  useEffect(() => {
    refreshProfile();

    // El interceptor de Axios emite este evento cuando la sesión deja de ser válida
    const onExpired = (event: Event) => {
      setProfile(null);
      const message = (event as CustomEvent<string | undefined>).detail;
      if (message) toast.error('Sesión finalizada', { description: message, duration: 6000 });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
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
