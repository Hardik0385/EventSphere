import { User } from '@eventsphere/shared';

export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  ENVIRONMENT?: string;
  CORS_ORIGIN?: string;
  ADMIN_BOOTSTRAP_SECRET?: string;
}

export interface Variables {
  user: User;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}
