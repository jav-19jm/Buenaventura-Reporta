import { pendingRead, pendingWrite, NOT_MIGRATED, type ApiResult } from './client';
import type { Entidad, Perfil, Reporte } from '../types';

// ==========================================
// PANEL DE ENTIDADES INSTITUCIONALES (rol 'entidad')
// Cada función indica el comportamiento que debe cubrir el backend.
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
  tipo_accion: string;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
};

/** GET /entities/{id} */
export async function getEntityById(_entityId: string): Promise<ApiResult<Entidad>> {
  return pendingRead<Entidad>();
}

/**
 * GET /entities/{id}/reports?category= — reportes asignados a la entidad
 * (o de su categoría, si se envía) con perfiles(nombre_completo, email).
 */
export async function getEntityReports(_entityId: string, _category?: string): Promise<ApiResult<(Reporte & { perfil?: Perfil })[]>> {
  return pendingRead<(Reporte & { perfil?: Perfil })[]>([]);
}

/** GET /entities/{id}/stats — conteo de reportes asignados por estado */
export async function getEntityStats(_entityId: string): Promise<ApiResult<EntityStats>> {
  return pendingRead<EntityStats>();
}

/** GET /entities — todas las entidades */
export async function getAllEntities(): Promise<ApiResult<Entidad[]>> {
  return pendingRead<Entidad[]>([]);
}

/**
 * PATCH /entity/reports/{id}/status { estado } — al pasar a 'resuelto' incrementa
 * perfiles.reportes_resueltos del creador y le envía una notificación.
 */
export async function updateReportStatus(_reportId: string, _estado: string): Promise<ApiResult<Reporte>> {
  return pendingWrite();
}

/** PUT /entities/{id} — datos de perfil de la entidad (descripción, sitio web, color, logo...) */
export async function updateEntityDetails(_entityId: string, _updates: Partial<Entidad>): Promise<ApiResult<Entidad>> {
  return pendingWrite();
}

/** POST /entities/{id}/logo (multipart) -> { url } y actualiza entidades.logo_url */
export async function uploadEntityLogo(_entityId: string, _file: File): Promise<{ url: string | null; error: string | null }> {
  return { url: null, error: NOT_MIGRATED };
}

/** GET /entities/{id}/activity — últimas 50 acciones de auditoría */
export async function getEntityActivity(_entityId: string): Promise<ApiResult<ActividadEntidad[]>> {
  return pendingRead<ActividadEntidad[]>([]);
}

/** POST /entities/{id}/activity { tipo_accion, titulo, descripcion } */
export async function logEntityActivity(_entityId: string, _tipoAccion: string, _titulo: string, _descripcion: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}
