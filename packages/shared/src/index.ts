import { z } from 'zod';

// ==========================================
// 1. Core Entity Types
// ==========================================

export type UserRole = 'admin' | 'organizer' | 'participant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserWithPasswordHash extends User {
  password_hash: string;
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  start_time: string;
  end_time: string;
  capacity: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  // Computed fields returned in queries
  organizer_name?: string;
  organizer_email?: string;
  confirmed_registrations_count?: number;
  remaining_capacity?: number;
  is_user_registered?: boolean;
}

export type RegistrationStatus = 'confirmed' | 'cancelled';

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  ticket_code: string;
  registration_status: RegistrationStatus;
  created_at: string;
  // Join fields
  event_title?: string;
  event_category?: string;
  event_location?: string;
  event_start_time?: string;
  event_end_time?: string;
  event_status?: EventStatus;
  user_name?: string;
  user_email?: string;
  checked_in_at?: string | null;
}

export interface CheckIn {
  id: string;
  registration_id: string;
  checked_in_at: string;
  verified_by: string;
  // Join fields
  ticket_code?: string;
  user_name?: string;
  user_email?: string;
  event_title?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

// ==========================================
// 2. Validation Schemas (Zod)
// ==========================================

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['organizer', 'participant']).default('participant'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const EventBaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  location: z.string().min(2, 'Location/Venue is required'),
  start_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid start date-time required',
  }),
  end_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid end date-time required',
  }),
  capacity: z.coerce.number().int().positive('Capacity must be a positive integer'),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('published'),
});

export const CreateEventSchema = EventBaseSchema.refine((data) => new Date(data.end_time) > new Date(data.start_time), {
  message: 'End time must be after start time',
  path: ['end_time'],
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = EventBaseSchema.partial();

export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

export const VerifyTicketSchema = z.object({
  ticket_code: z.string().min(4, 'Ticket code is required').trim(),
});

export type VerifyTicketInput = z.infer<typeof VerifyTicketSchema>;

export const CheckInSchema = z.object({
  ticket_code: z.string().min(4, 'Ticket code is required').trim(),
});

export type CheckInInput = z.infer<typeof CheckInSchema>;

export const UpdateUserRoleSchema = z.object({
  role: z.enum(['admin', 'organizer', 'participant']),
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;

// ==========================================
// 3. Analytics & Dashboard Interfaces
// ==========================================

export interface OrganizerStats {
  total_events: number;
  active_events: number;
  total_registrations: number;
  total_checkins: number;
  attendance_rate: number;
  capacity_utilization: number;
  upcoming_events: Event[];
  registration_trends: { date: string; count: number }[];
  event_attendance_breakdown: { title: string; registered: number; checked_in: number; capacity: number }[];
}

export interface AdminStats {
  total_users: number;
  total_organizers: number;
  total_participants: number;
  total_events: number;
  total_registrations: number;
  total_checkins: number;
  overall_attendance_rate: number;
  registrations_over_time: { date: string; count: number }[];
  events_by_category: { category: string; count: number }[];
  recent_events: Event[];
  recent_activity: AuditLog[];
}

export interface SingleEventAnalytics {
  event: Event;
  total_registrations: number;
  total_checkins: number;
  attendance_rate: number;
  capacity_utilization: number;
  registrations_timeline: { date: string; count: number }[];
}

// ==========================================
// 4. API Response Wrappers
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  environment: string;
  timestamp: string;
  database: 'connected' | 'disconnected' | 'unknown';
  serverless_edge_region?: string;
  version: string;
}
