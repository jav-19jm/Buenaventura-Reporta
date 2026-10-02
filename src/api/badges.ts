import { api, toResult, type ApiResult } from './client';
import type { Insignia } from '../types';

// ==========================================
// INSIGNIAS
// El backend las otorga automáticamente (App\Services\InsigniaService).
// ==========================================

export type InsigniaObtenida = Insignia & { fecha_obtencion: string };

/** GET /users/{id}/badges — insignias del usuario, las más recientes primero */
export async function getUserBadgesWithDetails(userId: string): Promise<ApiResult<InsigniaObtenida[]>> {
  return toResult(api.get(`/users/${userId}/badges`));
}
