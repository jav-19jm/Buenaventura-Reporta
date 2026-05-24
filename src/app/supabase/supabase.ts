import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../../environment/supabase.config';

// Intentar obtener de variables de entorno primero, luego usar config hardcoded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

console.log('🔌 Configurando Supabase...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key configurada:', supabaseAnonKey ? '✅' : '❌');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de base de datos
export type UserRole = 'citizen' | 'admin' | 'entity';
export type UserStatus = 'active' | 'suspended' | 'blocked';
export type ReportStatus = 'pendiente' | 'en-revision' | 'en-proceso' | 'resuelto' | 'rechazado';
export type ReportPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type EntityCategory =
  | 'servicios-publicos'
  | 'transporte'
  | 'infraestructura'
  | 'seguridad'
  | 'emergencias'
  | 'salud'
  | 'medio-ambiente';
export type NotificationType =
  | 'report_created'
  | 'report_updated'
  | 'report_resolved'
  | 'message_received'
  | 'entity_assigned'
  | 'system';

// Interfaces de base de datos
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  reputation_score: number;
  positive_votes: number;
  negative_votes: number;
  reports_created: number;
  reports_resolved: number;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: EntityCategory;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  color: string | null;
  is_active: boolean;
  assigned_reports: number;
  resolved_reports: number;
  average_resolution_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string | null;
  entity_id: string | null;
  title: string;
  description: string;
  category: string;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  status: ReportStatus;
  priority: ReportPriority;
  is_public: boolean;
  views_count: number;
  upvotes: number;
  downvotes: number;
  assigned_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  report_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'entity';
  message: string;
  is_official: boolean;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  report_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  author_id: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReportHistory {
  id: string;
  report_id: string;
  user_id: string | null;
  action: string;
  old_value: string | null;
  new_value: string | null;
  description: string | null;
  created_at: string;
}

export interface ReportVote {
  id: string;
  report_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}
