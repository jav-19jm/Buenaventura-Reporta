import { pendingRead, type ApiResult } from './client';
import type { Insignia } from '../types';

// ==========================================
// INSIGNIAS
// El otorgamiento automático debe ejecutarlo el backend al ocurrir el evento,
// nunca el cliente. Reglas vigentes (por nombre de insignia):
//   'Primer Reporte' reportes_creados >= 1   | '10 Reportes' >= 10 | '50 Reportes' >= 50
//   'Solucionador'   reportes_resueltos >= 1 | 'Embajador' puntuacion_reputacion >= 100
// ==========================================

export type InsigniaObtenida = Insignia & { fecha_obtencion: string };

/** GET /users/{id}/badges — insignias del usuario con su detalle, más recientes primero */
export async function getUserBadgesWithDetails(_userId: string): Promise<ApiResult<InsigniaObtenida[]>> {
  return pendingRead<InsigniaObtenida[]>([]);
}
