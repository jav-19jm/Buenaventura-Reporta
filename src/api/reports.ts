import { api, toResult, type ApiResult } from './client';
import type { CategoriaReporte, EstadoReporte, Mensaje, Noticia, PrioridadReporte, Reporte } from '../types';

// ==========================================
// REPORTES CIUDADANOS
// ==========================================

export type NuevoReporte = {
  titulo: string;
  descripcion: string;
  categoria: string;
  direccion_ubicacion: string;
  latitud?: string;
  longitud?: string;
  prioridad?: PrioridadReporte;
  id_entidad?: string | null;
};

/**
 * POST /reports — crea el reporte del usuario autenticado. Si no se indica
 * entidad, el backend asigna la responsable por defecto de la categoría.
 */
export async function createReport(reportData: NuevoReporte): Promise<ApiResult<Reporte>> {
  return toResult(api.post('/reports', reportData));
}

/** GET /reports — reportes visibles con su autor (perfiles) y entidad (entidades) */
export async function getPublicReports(): Promise<ApiResult<Reporte[]>> {
  return toResult(api.get('/reports'));
}

/** GET /admin/reports — todos los reportes (incluidos los ocultos) con autor y entidad */
export async function getAdminReports(): Promise<ApiResult<Reporte[]>> {
  return toResult(api.get('/admin/reports'));
}

/** GET /users/me/reports — reportes visibles del usuario autenticado */
export async function getUserReports(): Promise<ApiResult<Reporte[]>> {
  return toResult(api.get('/users/me/reports'));
}

/** GET /reports/{id} — detalle con autor y entidad asignada */
export async function getReportById(reportId: string): Promise<ApiResult<Reporte>> {
  return toResult(api.get(`/reports/${reportId}`));
}

/** PATCH /reports/{id}/status { estado } — registra el cambio en historial_reportes */
export async function updateReportStatus(reportId: string, estado: EstadoReporte): Promise<ApiResult<Reporte>> {
  return toResult(api.patch(`/reports/${reportId}/status`, { estado }));
}

/** DELETE /reports/{id} — solo el autor; borrado lógico (visible = false) */
export async function deleteReport(reportId: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.delete(`/reports/${reportId}`));
  return { error };
}

/**
 * POST /reports/{id}/votes { tipo_voto } — un voto por usuario (se puede cambiar, no repetir).
 * El backend recalcula los votos del reporte y la reputación del autor.
 */
export async function voteReport(reportId: string, tipoVoto: 'voto_positivo' | 'voto_negativo'): Promise<{ error: string | null }> {
  const { error } = await toResult(api.post(`/reports/${reportId}/votes`, { tipo_voto: tipoVoto }));
  return { error };
}

/** POST /reports/{id}/image (multipart) -> { url } */
export async function uploadReportImage(file: File, reportId: string): Promise<{ url: string | null; error: string | null }> {
  const form = new FormData();
  form.append('imagen', file);

  const { data, error } = await toResult<{ url: string }>(api.post(`/reports/${reportId}/image`, form));
  return { url: data?.url ?? null, error };
}

// ==========================================
// MENSAJES (chat de seguimiento del reporte)
// Solo participan el autor, la entidad asignada y la administración.
// ==========================================

/** GET /reports/{id}/messages — orden cronológico, con el remitente en "perfiles" */
export async function getReportMessages(reporteId: string): Promise<ApiResult<Mensaje[]>> {
  return toResult(api.get(`/reports/${reporteId}/messages`));
}

/**
 * POST /reports/{id}/messages { mensaje } — el tipo de remitente lo deduce el backend del rol
 * y notifica al autor, a los administradores y a la entidad asignada.
 */
export async function createReportMessage(reporteId: string, mensaje: string): Promise<ApiResult<Mensaje>> {
  return toResult(api.post(`/reports/${reporteId}/messages`, { mensaje }));
}

/** PATCH /messages/{id} — solo el autor y dentro de los primeros 5 minutos */
export async function updateReportMessage(mensajeId: string, nuevoMensaje: string): Promise<ApiResult<Mensaje>> {
  return toResult(api.patch(`/messages/${mensajeId}`, { mensaje: nuevoMensaje }));
}

/** DELETE /messages/{id} — solo el autor y dentro de los primeros 5 minutos */
export async function deleteReportMessage(mensajeId: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.delete(`/messages/${mensajeId}`));
  return { error };
}

// ==========================================
// CATÁLOGOS PÚBLICOS
// ==========================================

/** GET /report-categories — categorías activas ordenadas por nombre */
export async function getReportCategories(): Promise<ApiResult<CategoriaReporte[]>> {
  return toResult(api.get('/report-categories'));
}

/** GET /news — noticias publicadas, más recientes primero, con la entidad autora */
export async function getPublicNews(): Promise<ApiResult<Noticia[]>> {
  return toResult(api.get('/news'));
}
