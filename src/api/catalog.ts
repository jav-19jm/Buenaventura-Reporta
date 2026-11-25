import { api, toResult, type ApiResult } from './client';
import type { Entidad, Servicio } from '../types';

// ==========================================
// CATÁLOGOS PÚBLICOS (solo elementos activos)
// La administración usa sus propias rutas en api/admin.ts, que incluyen los inactivos.
// ==========================================

/** GET /entities — entidades activas ordenadas por nombre */
export async function getActiveEntities(): Promise<ApiResult<Entidad[]>> {
  return toResult(api.get('/entities'));
}

/** GET /services — servicios activos del mapa */
export async function getActiveServices(): Promise<ApiResult<Servicio[]>> {
  return toResult(api.get('/services'));
}
