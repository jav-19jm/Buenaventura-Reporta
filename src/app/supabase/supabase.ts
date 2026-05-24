import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../../environment/supabase.config';

// Intentar obtener de variables de entorno primero, luego usar config hardcoded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

console.log('🔌 Configurando Supabase...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key configurada:', supabaseAnonKey ? '✅' : '❌');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de base de datos (EN ESPAÑOL)
export type RolUsuario = 'ciudadano' | 'entidad' | 'moderador' | 'administrador';
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido';
export type EstadoReporte = 'pendiente' | 'en_revision' | 'en_proceso' | 'resuelto' | 'cancelado';
export type PrioridadReporte = 'baja' | 'media' | 'alta' | 'critica';
export type TipoEntidad = 
  | 'servicios-publicos'
  | 'seguridad'
  | 'salud'
  | 'infraestructura'
  | 'ambiente'
  | 'otro';
export type TipoNotificacion =
  | 'reporte_actualizado'
  | 'nuevo_mensaje'
  | 'reporte_resuelto'
  | 'mencion'
  | 'alerta_sistema';

// Interfaces de base de datos (EN ESPAÑOL)
export interface Perfil {
  id: string;
  email: string;
  nombre_completo: string | null;
  telefono: string | null;
  url_avatar: string | null;
  rol: RolUsuario;
  estado: EstadoUsuario;
  puntuacion_reputacion: number;
  votos_positivos: number;
  votos_negativos: number;
  reportes_creados: number;
  reportes_resueltos: number;
  id_entidad: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}


export interface Entidad {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  tipo: TipoEntidad;
  email: string | null;
  telefono: string | null;
  color: string | null;
  logo_url: string | null;
  sitio_web: string | null;
  esta_activa: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Reporte {
  id: string;
  id_usuario: string | null;
  id_entidad: string | null;
  titulo: string;
  descripcion: string;
  categoria: string;
  direccion_ubicacion: string | null;
  latitud: string | null;
  longitud: string | null;
  url_imagen: string | null;
  estado: EstadoReporte;
  prioridad: PrioridadReporte;
  votos_positivos: number;
  votos_negativos: number;
  visto: boolean;
  visible: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  entidades?: Entidad;
  perfiles?: Perfil;
}

export interface Mensaje {
  id: string;
  id_reporte: string;
  id_remitente: string | null;
  tipo_remitente: 'usuario' | 'entidad' | 'moderador';
  mensaje: string;
  fecha_creacion: string;
}

export interface Notificacion {
  id: string;
  id_usuario: string;
  id_reporte: string | null;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  esta_leida: boolean;
  fecha_creacion: string;
}

export interface Noticia {
  id: string;
  id_entidad: string | null;
  titulo: string;
  contenido: string;
  url_imagen: string | null;
  esta_publicada: boolean;
  fecha_publicacion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  entidades?: Entidad;
}

export interface HistorialReporte {
  id: string;
  id_reporte: string;
  accion: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  id_usuario: string | null;
  fecha_creacion: string;
}

export interface VotoReporte {
  id: string;
  id_reporte: string;
  id_usuario: string;
  tipo_voto: 'voto_positivo' | 'voto_negativo';
  fecha_creacion: string;
}

export interface CategoriaReporte {
  id: string;
  nombre: string;
  icono: string | null;
  color: string | null;
  descripcion: string | null;
  esta_activa: boolean;
  fecha_creacion: string;
}

export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  requisito_texto: string | null;
}

export interface InsigniaUsuario {
  id: string;
  id_usuario: string;
  id_insignia: string;
  fecha_obtencion: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  latitud: string;
  longitud: string;
  direccion: string | null;
  horario: string | null;
  telefono: string | null;
  esta_activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

