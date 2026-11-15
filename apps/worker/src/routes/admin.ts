import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logAudit } from '../lib/audit';
import { hashPassword } from '../lib/crypto';
import { UpdateUserRoleSchema, User } from '@eventsphere/shared';

const adminApp = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/admin/users - List all users
adminApp.get('/users', authMiddleware, requireRole('admin'), async (c) => {
  const users = await c.env.DB
    .prepare(`
      SELECT 
        u.id, u.name, u.email, u.role, u.created_at, u.updated_at,
        COALESCE(r.reg_count, 0) as total_registrations,
        COALESCE(e.event_count, 0) as total_events_organized
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as reg_count 
        FROM registrations 
        WHERE registration_status = 'confirmed' 
        GROUP BY user_id
      ) r ON u.id = r.user_id
      LEFT JOIN (
        SELECT organizer_id, COUNT(*) as event_count 
        FROM events 
        GROUP BY organizer_id
      ) e ON u.id = e.organizer_id
      ORDER BY u.created_at DESC
    `)
    .all<any>();

  return c.json({
    success: true,
    data: users.results || [],
  });
});

// PATCH /api/admin/users/:id/role - Change user role
adminApp.patch('/users/:id/role', authMiddleware, requireRole('admin'), async (c) => {
  const targetUserId = c.req.param('id') || '';
  const adminUser = c.get('user');

  // Prevent admin from modifying their own role to prevent accidental lockout
  if (targetUserId === adminUser.id) {
    return c.json({ success: false, error: 'Cannot change your own role' }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const parseResult = UpdateUserRoleSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid role data',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const { role } = parseResult.data;
  const now = new Date().toISOString();

  const result = await c.env.DB
    .prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
    .bind(role, now, targetUserId)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  await logAudit(c.env.DB, adminUser.id, `ROLE_UPDATED_TO_${role.toUpperCase()}`, 'USER', targetUserId);

  return c.json({
    success: true,
    message: `User role updated to ${role} successfully.`,
  });
});

// GET /api/admin/events - List all events platform-wide
adminApp.get('/events', authMiddleware, requireRole('admin'), async (c) => {
  const events = await c.env.DB
    .prepare(`
      SELECT 
        e.*,
        u.name as organizer_name,
        u.email as organizer_email,
        COALESCE(r.reg_count, 0) as confirmed_registrations_count,
        COALESCE(chk.checkin_count, 0) as checkins_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN (
        SELECT event_id, COUNT(*) as reg_count 
        FROM registrations 
        WHERE registration_status = 'confirmed' 
        GROUP BY event_id
      ) r ON e.id = r.event_id
      LEFT JOIN (
        SELECT r.event_id, COUNT(chk.id) as checkin_count
        FROM registrations r
        JOIN check_ins chk ON r.id = chk.registration_id
        GROUP BY r.event_id
      ) chk ON e.id = chk.event_id
      ORDER BY e.created_at DESC
    `)
    .all<any>();

  return c.json({
    success: true,
    data: events.results || [],
  });
});

// DELETE /api/admin/events/:id - Delete event platform-wide
adminApp.delete('/events/:id', authMiddleware, requireRole('admin'), async (c) => {
  const eventId = c.req.param('id') || '';
  const adminUser = c.get('user');

  const result = await c.env.DB
    .prepare('DELETE FROM events WHERE id = ?')
    .bind(eventId)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ success: false, error: 'Event not found' }, 404);
  }

  await logAudit(c.env.DB, adminUser.id, 'ADMIN_DELETED_EVENT', 'EVENT', eventId);

  return c.json({
    success: true,
    message: 'Event deleted by administrator',
  });
});

// POST /api/admin/bootstrap - Safe initial admin creation with bootstrap secret
adminApp.post('/bootstrap', async (c) => {
  const secretHeader = c.req.header('x-admin-bootstrap-secret');
  const expectedSecret = c.env.ADMIN_BOOTSTRAP_SECRET || 'eventsphere-admin-bootstrap-dev-token';

  if (!secretHeader || secretHeader !== expectedSecret) {
    return c.json({ success: false, error: 'Invalid bootstrap token' }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const email = body?.email || 'admin@eventsphere.cloud';
  const name = body?.name || 'Platform Administrator';
  const password = body?.password || 'password123';

  const existing = await c.env.DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first();

  if (existing) {
    // Elevate existing user to admin
    await c.env.DB
      .prepare("UPDATE users SET role = 'admin' WHERE email = ?")
      .bind(email)
      .run();

    return c.json({
      success: true,
      message: `User ${email} elevated to administrator.`,
    });
  }

  const userId = `usr-${crypto.randomUUID()}`;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  await c.env.DB
    .prepare("INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)")
    .bind(userId, name, email, passwordHash, now, now)
    .run();

  await logAudit(c.env.DB, userId, 'ADMIN_BOOTSTRAP_INITIALIZED', 'USER', userId);

  return c.json({
    success: true,
    message: 'Initial administrator created successfully.',
    data: { email, role: 'admin' },
  }, 201);
});

export default adminApp;
