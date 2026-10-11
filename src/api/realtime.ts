import { useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { api, getToken } from './client';

// ==========================================
// TIEMPO REAL (Laravel Reverb vía Laravel Echo)
//
// En Docker el WebSocket pasa por el mismo nginx que sirve la app
// (ruta /app → backend:8080), así que por defecto se usa el host y el
// puerto de la página. Sin VITE_REVERB_APP_KEY el tiempo real queda
// desactivado y la UI sigue funcionando con consultas periódicas.
// ==========================================

const APP_KEY = import.meta.env.VITE_REVERB_APP_KEY;

let echo: Echo<'reverb'> | null = null;

function puertoPorDefecto(): number {
  if (window.location.port) return Number(window.location.port);
  return window.location.protocol === 'https:' ? 443 : 80;
}

/** Devuelve la conexión compartida (o null si el tiempo real está desactivado) */
export function getEcho(): Echo<'reverb'> | null {
  if (!APP_KEY) return null;
  if (echo) return echo;

  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

  const puerto = Number(import.meta.env.VITE_REVERB_PORT) || puertoPorDefecto();

  echo = new Echo({
    broadcaster: 'reverb',
    key: APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: puerto,
    wssPort: puerto,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || window.location.protocol.replace(':', '')) === 'https',
    enabledTransports: ['ws', 'wss'],
    // Canales privados: se autorizan con el JWT vigente en POST /api/broadcasting/auth
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: (error: Error | null, data: { auth: string } | null) => void) => {
        if (!getToken()) {
          callback(new Error('Sin sesión'), null);
          return;
        }
        api
          .post('/broadcasting/auth', { socket_id: socketId, channel_name: channel.name })
          .then((response) => callback(null, response.data))
          .catch((error) => callback(error, null));
      },
    }),
  });

  return echo;
}

/** Cierra la conexión (al cerrar sesión) */
export function disconnectEcho() {
  echo?.disconnect();
  echo = null;
}

type TipoCanal = 'private' | 'public';

/**
 * Suscribe el componente a un evento de un canal mientras esté montado.
 * `canal` en null desactiva la suscripción (por ejemplo, sin sesión).
 * El nombre del evento es el de broadcastAs() en el backend.
 */
export function useCanal(canal: string | null, evento: string, alRecibir: (datos: unknown) => void, tipo: TipoCanal = 'private') {
  // La última versión del callback, sin volver a suscribirse en cada render
  const callback = useRef(alRecibir);
  callback.current = alRecibir;

  useEffect(() => {
    const conexion = getEcho();
    if (!conexion || !canal) return;

    const suscripcion = tipo === 'private' ? conexion.private(canal) : conexion.channel(canal);
    const manejador = (datos: unknown) => callback.current(datos);
    suscripcion.listen(`.${evento}`, manejador);

    return () => {
      suscripcion.stopListening(`.${evento}`, manejador);
      conexion.leave(canal);
    };
  }, [canal, evento, tipo]);
}

/** Indica si el tiempo real está configurado (para espaciar las consultas periódicas) */
export const tiempoRealActivo = Boolean(APP_KEY);
