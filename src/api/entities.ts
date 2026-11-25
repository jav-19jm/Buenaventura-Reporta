import { api, toResult, type ApiResult } from './client';
import type { Entidad, Reporte } from '../types';

// ==========================================
// PANEL DE ENTIDADES INSTITUCIONALES (rol 'entidad')
// Todas las rutas /entity actúan sobre la entidad vinculada a la cuenta
// autenticada (users.id_entidad); el backend no acepta otro id.
// ==========================================

export type EntityStats = {
  total: number;
  pendiente: number;
  en_revision: number;
  en_proceso: number;
  resuelto: number;
  cancelado: number;
};

export type ActividadEntidad = {
  id: string;
  id_entidad: string;
  tipo_accion: 'auth' | 'update' | 'reporte' | string;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
};

/** GET /entity — entidad de la cuenta autenticada */
export async function getMyEntity(): Promise<ApiResult<Entidad>> {
  return toResult(api.get('/entity'));
}

/** GET /entity/reports — reportes asignados a la entidad, con su autor (perfiles) */
export async function getEntityReports(): Promise<ApiResult<Reporte[]>> {
  return toResult(api.get('/entity/reports'));
}

/** GET /entity/stats — conteo de reportes asignados por estado */
export async function getEntityStats(): Promise<ApiResult<EntityStats>> {
  return toResult(api.get('/entity/stats'));
}

/**
 * PATCH /reports/{id}/status — la entidad asignada cambia el estado; al pasar a
 * "resuelto" el backend suma reportes_resueltos al autor y le notifica.
 */
export async function updateReportStatus(reportId: string, estado: string): Promise<ApiResult<Reporte>> {
  return toResult(api.patch(`/reports/${reportId}/status`, { estado }));
}

/** PUT /entity — datos de contacto y presentación (descripción, teléfono, sitio web, color) */
export async function updateEntityDetails(updates: Partial<Pick<Entidad, 'descripcion' | 'telefono' | 'sitio_web' | 'color'>>): Promise<ApiResult<Entidad>> {
  return toResult(api.put('/entity', updates));
}

/** POST /entity/logo (multipart) -> { url } */
export async function uploadEntityLogo(file: File): Promise<{ url: string | null; error: string | null }> {
  const form = new FormData();
  form.append('logo', file);

  const { data, error } = await toResult<{ url: string }>(api.post('/entity/logo', form));
  return { url: data?.url ?? null, error };
}

/**
 * GET /entity/activity — últimas 50 acciones de auditoría. El backend las registra
 * solo (inicios de sesión, cambios de estado, asignaciones y cambios de perfil).
 */
export async function getEntityActivity(): Promise<ApiResult<ActividadEntidad[]>> {
  return toResult(api.get('/entity/activity'));
}
