import { api, pendingRead, pendingWrite, toResult, NOT_MIGRATED, type ApiResult } from './client';
import type { Entidad, EstadoUsuario, Noticia, Perfil, Reporte, RolUsuario, Servicio, TipoEntidad } from '../types';

// ==========================================
// ADMINISTRACIÓN (todas las rutas exigen rol 'administrador' en el backend)
// Cada función indica el comportamiento que debe cubrir el backend.
// ==========================================

// ---------- Usuarios ----------

/** GET /admin/users — todos los perfiles, más recientes primero */
export async function getAllUsers(): Promise<ApiResult<Perfil[]>> {
  return pendingRead<Perfil[]>([]);
}

/** PATCH /admin/users/{id}/status { estado, motivo_bloqueo } */
export async function updateUserStatus(_userId: string, _estado: EstadoUsuario, _motivo?: string): Promise<ApiResult<Perfil>> {
  return pendingWrite();
}

/** PATCH /admin/users/{id}/role { rol } */
export async function updateUserRole(_userId: string, _rol: RolUsuario | string): Promise<ApiResult<Perfil>> {
  return pendingWrite();
}

// ---------- Entidades ----------

export type EntidadForm = Omit<Partial<Entidad>, "tipo"> & { tipo?: TipoEntidad | string; password?: string };

/** GET /entities — entidades activas ordenadas por nombre (pendiente: listado admin con inactivas) */
export async function getAllEntities(): Promise<ApiResult<Entidad[]>> {
  return toResult(api.get('/entities'));
}

/**
 * POST /admin/entities — crea la entidad Y su cuenta institucional (email + password,
 * rol 'entidad', perfiles.id_entidad vinculado) en una sola transacción.
 */
export async function createEntity(_entity: EntidadForm): Promise<ApiResult<Entidad>> {
  return pendingWrite();
}

/**
 * PUT /admin/entities/{id} — actualiza la entidad y sincroniza nombre/email del perfil
 * vinculado; si llega password (>= 6 caracteres) cambia la contraseña de esa cuenta.
 */
export async function updateEntity(_id: string, _updates: EntidadForm): Promise<ApiResult<Entidad>> {
  return pendingWrite();
}

/** DELETE /admin/entities/{id} */
export async function deleteEntity(_id: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

// ---------- Noticias ----------

/** GET /admin/news — todas las noticias (publicadas o no) con su entidad */
export async function getAllNews(): Promise<ApiResult<Noticia[]>> {
  return pendingRead<Noticia[]>([]);
}

/** POST /admin/news — si se crea publicada, notifica a todos los ciudadanos */
export async function createNews(_news: Partial<Noticia>): Promise<ApiResult<Noticia>> {
  return pendingWrite();
}

/** PUT /admin/news/{id} */
export async function updateNews(_id: string, _updates: Partial<Noticia>): Promise<ApiResult<Noticia>> {
  return pendingWrite();
}

/** DELETE /admin/news/{id} */
export async function deleteNews(_id: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

/** PATCH /admin/news/{id}/publish { esta_publicada } — fija fecha_publicacion al publicar */
export async function togglePublishNews(_id: string, _estaPublicada: boolean): Promise<ApiResult<Noticia>> {
  return pendingWrite();
}

/** POST /admin/news/{id}/image (multipart) -> { url } y actualiza noticias.url_imagen */
export async function uploadNewsImage(_file: File, _newsId: string): Promise<{ url: string | null; error: string | null }> {
  return { url: null, error: NOT_MIGRATED };
}

// ---------- Reportes ----------

/** PATCH /admin/reports/{id}/entity { id_entidad } — notifica al creador y a la entidad asignada */
export async function assignReportEntity(_reportId: string, _idEntidad: string): Promise<ApiResult<Reporte>> {
  return pendingWrite();
}

/** DELETE /admin/reports/{id} — borrado lógico (visible = false) */
export async function deleteReportAdmin(_reportId: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}

/** POST /reports/{id}/messages como moderador */
export async function addAdminComment(_reportId: string, _mensaje: string): Promise<ApiResult<unknown>> {
  return pendingWrite();
}

export type AdminStats = {
  reports: { total: number; byStatus: Record<string, number>; byCategory: Record<string, number> };
  users: { total: number; byStatus: Record<string, number> };
  entities: number;
};

/** GET /admin/stats — conteos de reportes por estado/categoría, usuarios por estado y total de entidades */
export async function getAdminStats(): Promise<ApiResult<AdminStats>> {
  return pendingRead<AdminStats>();
}

// ---------- Servicios de la ciudad (puntos de interés del mapa) ----------

/** GET /services — servicios activos */
export async function getAllServices(): Promise<ApiResult<Servicio[]>> {
  return toResult(api.get('/services'));
}

/** POST /admin/services — notifica a los ciudadanos del nuevo servicio */
export async function createService(_service: Partial<Servicio>): Promise<ApiResult<Servicio>> {
  return pendingWrite();
}

/** PUT /admin/services/{id} */
export async function updateService(_id: string, _updates: Partial<Servicio>): Promise<ApiResult<Servicio>> {
  return pendingWrite();
}

/** DELETE /admin/services/{id} */
export async function deleteService(_id: string): Promise<{ error: string | null }> {
  return { error: NOT_MIGRATED };
}
