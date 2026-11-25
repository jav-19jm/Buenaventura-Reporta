import { api, toResult, type ApiResult } from './client';
import type { Entidad, EstadoUsuario, Mensaje, Noticia, Perfil, Reporte, RolUsuario, Servicio, TipoEntidad } from '../types';

// ==========================================
// ADMINISTRACIÓN (todas las rutas /admin exigen rol 'administrador' en el backend)
// ==========================================

// ---------- Usuarios ----------

/** GET /admin/users — todos los usuarios, más recientes primero */
export async function getAllUsers(): Promise<ApiResult<Perfil[]>> {
  return toResult(api.get('/admin/users'));
}

/** PATCH /admin/users/{id}/status — el bloqueo aplica de inmediato sobre sus sesiones abiertas */
export async function updateUserStatus(userId: string, estado: EstadoUsuario, motivo?: string): Promise<ApiResult<Perfil>> {
  return toResult(api.patch(`/admin/users/${userId}/status`, { estado, motivo_bloqueo: motivo || null }));
}

/** PATCH /admin/users/{id}/role — ciudadano, moderador o administrador (el rol entidad se gestiona en Entidades) */
export async function updateUserRole(userId: string, rol: RolUsuario | string): Promise<ApiResult<Perfil>> {
  return toResult(api.patch(`/admin/users/${userId}/role`, { rol }));
}

// ---------- Entidades ----------

export type EntidadForm = Omit<Partial<Entidad>, 'tipo'> & { tipo?: TipoEntidad | string; password?: string };

/** GET /admin/entities — todas las entidades, incluidas las inactivas */
export async function getAllEntities(): Promise<ApiResult<Entidad[]>> {
  return toResult(api.get('/admin/entities'));
}

/** POST /admin/entities — crea la entidad y su cuenta institucional (correo + contraseña) */
export async function createEntity(entity: EntidadForm): Promise<ApiResult<Entidad>> {
  return toResult(api.post('/admin/entities', entity));
}

/**
 * PUT /admin/entities/{id} — sincroniza nombre y correo de la cuenta institucional;
 * si llega password (mín. 8 caracteres) cambia su contraseña.
 */
export async function updateEntity(id: string, updates: EntidadForm): Promise<ApiResult<Entidad>> {
  return toResult(api.put(`/admin/entities/${id}`, updates));
}

/** DELETE /admin/entities/{id} — sus reportes quedan sin asignar y sus cuentas se desactivan */
export async function deleteEntity(id: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.delete(`/admin/entities/${id}`));
  return { error };
}

// ---------- Noticias ----------

/** GET /admin/news — todas las noticias (publicadas y borradores) con su entidad */
export async function getAllNews(): Promise<ApiResult<Noticia[]>> {
  return toResult(api.get('/admin/news'));
}

/** POST /admin/news — al publicarse por primera vez se notifica a los ciudadanos */
export async function createNews(news: Partial<Noticia>): Promise<ApiResult<Noticia>> {
  return toResult(api.post('/admin/news', news));
}

/** PUT /admin/news/{id} */
export async function updateNews(id: string, updates: Partial<Noticia>): Promise<ApiResult<Noticia>> {
  return toResult(api.put(`/admin/news/${id}`, updates));
}

/** DELETE /admin/news/{id} */
export async function deleteNews(id: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.delete(`/admin/news/${id}`));
  return { error };
}

/** PATCH /admin/news/{id}/publish — fija fecha_publicacion al publicar */
export async function togglePublishNews(id: string, estaPublicada: boolean): Promise<ApiResult<Noticia>> {
  return toResult(api.patch(`/admin/news/${id}/publish`, { esta_publicada: estaPublicada }));
}

/** POST /admin/news/{id}/image (multipart) -> { url } */
export async function uploadNewsImage(file: File, newsId: string): Promise<{ url: string | null; error: string | null }> {
  const form = new FormData();
  form.append('imagen', file);

  const { data, error } = await toResult<{ url: string }>(api.post(`/admin/news/${newsId}/image`, form));
  return { url: data?.url ?? null, error };
}

// ---------- Reportes ----------

/** PATCH /admin/reports/{id}/entity — notifica al autor y a la entidad asignada */
export async function assignReportEntity(reportId: string, idEntidad: string): Promise<ApiResult<Reporte>> {
  return toResult(api.patch(`/admin/reports/${reportId}/entity`, { id_entidad: idEntidad }));
}

/** DELETE /admin/reports/{id} — borrado lógico (visible = false) */
export async function deleteReportAdmin(reportId: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.delete(`/admin/reports/${reportId}`));
  return { error };
}

/** POST /reports/{id}/messages — el backend lo registra como mensaje de la administración */
export async function addAdminComment(reportId: string, mensaje: string): Promise<ApiResult<Mensaje>> {
  return toResult(api.post(`/reports/${reportId}/messages`, { mensaje }));
}

export type AdminStats = {
  reports: { total: number; byStatus: Record<string, number>; byCategory: Record<string, number> };
  users: { total: number; byStatus: Record<string, number> };
  entities: number;
};

/** GET /admin/stats — reportes visibles por estado/categoría, usuarios por estado y total de entidades */
export async function getAdminStats(): Promise<ApiResult<AdminStats>> {
  return toResult(api.get('/admin/stats'));
}

// ---------- Servicios de la ciudad (puntos de interés del mapa) ----------

/** GET /admin/services — todos los servicios, incluidos los inactivos */
export async function getAllServices(): Promise<ApiResult<Servicio[]>> {
  return toResult(api.get('/admin/services'));
}

/** POST /admin/services — si se crea activo, se notifica a los ciudadanos */
export async function createService(service: Partial<Servicio>): Promise<ApiResult<Servicio>> {
  return toResult(api.post('/admin/services', service));
}

/** PUT /admin/services/{id} */
export async function updateService(id: string, updates: Partial<Servicio>): Promise<ApiResult<Servicio>> {
  return toResult(api.put(`/admin/services/${id}`, updates));
}

/** DELETE /admin/services/{id} */
export async function deleteService(id: string): Promise<{ error: string | null }> {
  const { error } = await toResult(api.delete(`/admin/services/${id}`));
  return { error };
}
