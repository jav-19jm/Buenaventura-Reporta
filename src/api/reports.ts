import { pendingRead, pendingWrite, NOT_MIGRATED, type ApiResult } from './client';
import type { CategoriaReporte, EstadoReporte, Mensaje, Noticia, PrioridadReporte, Reporte } from '../types';

// ==========================================
// REPORTES CIUDADANOS
// Cada función indica el comportamiento que debe cubrir el backend.
// ==========================================

export type NuevoReporte = {
  titulo: string;
  descripcion: string;
  categoria: string;
  direccion_ubicacion: string;
  latitud?: string;
  longitud?: string;
  url_imagen?: string;
  prioridad?: PrioridadReporte;
  id_entidad?: string | null;
};

/** POST /reports — crea el reporte del usuario autenticado e incrementa perfiles.reportes_creados */
export async function createReport(_reportData: NuevoReporte): Promise<ApiResult<Reporte>> {
  return pendingWrite();
}

/** GET /reports — reportes visibles con perfiles(id, nombre_completo, url_avatar) y entidades(id, nombre, slug, color) */
export async function getPublicReports(): Promise<ApiResult<Reporte[]>> {
  return pendingRead<Reporte[]>([]);
}

/** GET /admin/reports — todos los reportes (incluidos los ocultos) con perfil y entidad */
export async function getAdminReports(): Promise<ApiResult<Reporte[]>> {
  return pendingRead<Reporte[]>([]);
}

/** GET /users/me/reports — reportes visibles del usuario autenticado */
export async function getUserReports(): Promise<ApiResult<Reporte[]>> {
  return pendingRead<Reporte[]>([]);
}

/** GET /reports/{id} — detalle con perfil del creador y entidad asignada */
export async function getReportById(_reportId: string): Promise<ApiResult<Reporte>> {
  return pendingRead<Reporte>();
}

/** PATCH /reports/{id}/status { estado } — registra el cambio en historial_reportes */
export async function updateReportStatus(_reportId: string, _estado: EstadoReporte): Promise<ApiResult<Reporte>> {
  return pendingWrite();
}

/** DELETE /reports/{id} — solo el creador; borrado lógico (visible = false) */
export async function deleteReport(_reportId: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

/**
 * POST /reports/{id}/votes { tipo_voto } — un voto por usuario (se puede cambiar, no repetir).
 * El backend recalcula votos del reporte y la reputación del creador (perfiles.votos_*).
 */
export async function voteReport(_reportId: string, _tipoVoto: 'voto_positivo' | 'voto_negativo'): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

/** POST /reports/{id}/image (multipart) -> { url } y actualiza reportes.url_imagen */
export async function uploadReportImage(_file: File, _reportId: string): Promise<{ url: string | null; error: string | null }> {
  return { url: null, error: NOT_MIGRATED };
}

// ==========================================
// MENSAJES (chat de seguimiento del reporte)
// ==========================================

/** GET /reports/{id}/messages — orden cronológico, con perfil del remitente */
export async function getReportMessages(_reporteId: string): Promise<ApiResult<Mensaje[]>> {
  return pendingRead<Mensaje[]>([]);
}

/**
 * POST /reports/{id}/messages { mensaje } — el tipo de remitente lo deduce el backend del rol.
 * Debe notificar al creador del reporte, a los administradores y a la entidad asignada.
 */
export async function createReportMessage(
  _reporteId: string,
  _mensaje: string,
  _tipoRemitente?: 'usuario' | 'entidad' | 'moderador'
): Promise<ApiResult<Mensaje>> {
  return pendingWrite();
}

/** PATCH /messages/{id} — solo el autor y dentro de los primeros 5 minutos */
export async function updateReportMessage(_mensajeId: string, _nuevoMensaje: string): Promise<ApiResult<Mensaje>> {
  return pendingWrite();
}

/** DELETE /messages/{id} — solo el autor y dentro de los primeros 5 minutos */
export async function deleteReportMessage(_mensajeId: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

// ==========================================
// CATÁLOGOS PÚBLICOS
// ==========================================

/** GET /report-categories — categorías activas ordenadas por nombre */
export async function getReportCategories(): Promise<ApiResult<CategoriaReporte[]>> {
  return pendingRead<CategoriaReporte[]>([]);
}

/** GET /news — noticias publicadas, más recientes primero, con la entidad autora */
export async function getPublicNews(): Promise<ApiResult<Noticia[]>> {
  return pendingRead<Noticia[]>([]);
}
