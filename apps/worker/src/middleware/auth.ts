import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyJwt } from '../lib/jwt';
import { Env, Variables } from '../types';
import { User, UserRole } from '@eventsphere/shared';

const DEFAULT_JWT_SECRET = 'eventsphere-local-super-secret-jwt-key-minimum-32-chars-long';

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const secret = c.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  let token: string | undefined;

  // 1. Try Authorization header
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Fall back to cookie
  if (!token) {
    token = getCookie(c, 'auth_token');
  }

  if (!token) {
    return c.json({ success: false, error: 'Authentication required. Please log in.' }, 401);
  }

  const payload = await verifyJwt(token, secret);
  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired session. Please log in again.' }, 401);
  }

  // Fetch current user from D1
  const user = await c.env.DB
    .prepare('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?')
    .bind(payload.sub)
    .first<User>();

  if (!user) {
    return c.json({ success: false, error: 'User account not found.' }, 401);
  }

  c.set('user', user);
  await next();
}

export async function optionalAuthMiddleware(c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) {
  const secret = c.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  let token: string | undefined;

  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    token = getCookie(c, 'auth_token');
  }

  if (token) {
    const payload = await verifyJwt(token, secret);
    if (payload) {
      const user = await c.env.DB
        .prepare('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?')
        .bind(payload.sub)
        .first<User>();
      if (user) {
        c.set('user', user);
      }
    }
  }

  await next();
}

export function requireRole(...roles: UserRole[]) {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    if (!roles.includes(user.role)) {
      return c.json({ 
        success: false, 
        error: `Forbidden. Role '${user.role}' lacks permission for this resource.` 
      }, 403);
    }

    await next();
  };
}
