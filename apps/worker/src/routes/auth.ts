import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { Env, Variables } from '../types';
import { authMiddleware } from '../middleware/auth';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { signJwt } from '../lib/jwt';
import { logAudit } from '../lib/audit';
import { 
  RegisterSchema, 
  LoginSchema, 
  ChangePasswordSchema, 
  UpdateProfileSchema,
  User, 
  UserWithPasswordHash 
} from '@eventsphere/shared';

const authApp = new Hono<{ Bindings: Env; Variables: Variables }>();
const DEFAULT_JWT_SECRET = 'eventsphere-local-super-secret-jwt-key-minimum-32-chars-long';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

authApp.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parseResult = RegisterSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid registration input',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const { name, email, password, role } = parseResult.data;

  // Prevent regular users from assigning themselves admin role
  const assignedRole = role === 'organizer' ? 'organizer' : 'participant';

  // Check if email already taken
  const existing = await c.env.DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (existing) {
    return c.json({ success: false, error: 'An account with this email address already exists.' }, 409);
  }

  const userId = `usr-${crypto.randomUUID()}`;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  await c.env.DB
    .prepare('INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(userId, name, email, passwordHash, assignedRole, now, now)
    .run();

  await logAudit(c.env.DB, userId, 'USER_REGISTERED', 'USER', userId);

  const secret = c.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  const exp = Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS;
  const token = await signJwt({ sub: userId, email, role: assignedRole, exp }, secret);

  // Set secure HttpOnly cookie
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: c.env.ENVIRONMENT === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  const user: User = {
    id: userId,
    name,
    email,
    role: assignedRole,
    created_at: now,
    updated_at: now,
  };

  return c.json({
    success: true,
    message: 'Registration successful',
    data: { user, token },
  }, 201);
});

authApp.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parseResult = LoginSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid login details',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const { email, password } = parseResult.data;

  const user = await c.env.DB
    .prepare('SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = ?')
    .bind(email)
    .first<UserWithPasswordHash>();

  if (!user) {
    return c.json({ success: false, error: 'Invalid email or password.' }, 401);
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    return c.json({ success: false, error: 'Invalid email or password.' }, 401);
  }

  const secret = c.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  const exp = Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS;
  const token = await signJwt({ sub: user.id, email: user.email, role: user.role, exp }, secret);

  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: c.env.ENVIRONMENT === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  await logAudit(c.env.DB, user.id, 'USER_LOGGED_IN', 'USER', user.id);

  const cleanUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return c.json({
    success: true,
    message: 'Login successful',
    data: { user: cleanUser, token },
  });
});

authApp.post('/logout', async (c) => {
  deleteCookie(c, 'auth_token', {
    path: '/',
  });

  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});

authApp.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({
    success: true,
    data: { user },
  });
});

authApp.patch('/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => null);
  const parseResult = UpdateProfileSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid profile details',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const { name } = parseResult.data;
  const now = new Date().toISOString();

  await c.env.DB
    .prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?')
    .bind(name, now, user.id)
    .run();

  await logAudit(c.env.DB, user.id, 'USER_PROFILE_UPDATED', 'USER', user.id);

  const updatedUser: User = {
    ...user,
    name,
    updated_at: now,
  };

  return c.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser },
  });
});

authApp.post('/change-password', authMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => null);
  const parseResult = ChangePasswordSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid password details',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const { current_password, new_password } = parseResult.data;

  const userWithHash = await c.env.DB
    .prepare('SELECT password_hash FROM users WHERE id = ?')
    .bind(user.id)
    .first<{ password_hash: string }>();

  if (!userWithHash) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  const isCurrentValid = await verifyPassword(current_password, userWithHash.password_hash);
  if (!isCurrentValid) {
    return c.json({ success: false, error: 'Current password does not match.' }, 400);
  }

  const newHash = await hashPassword(new_password);
  const now = new Date().toISOString();

  await c.env.DB
    .prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .bind(newHash, now, user.id)
    .run();

  await logAudit(c.env.DB, user.id, 'USER_PASSWORD_CHANGED', 'USER', user.id);

  return c.json({
    success: true,
    message: 'Password changed successfully',
  });
});

export default authApp;
