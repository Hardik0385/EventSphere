import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';
import { generateTicketCode } from '../lib/crypto';
import { logAudit } from '../lib/audit';
import { Registration, Event } from '@eventsphere/shared';

const registrationsApp = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/events/:id/register - Register authenticated participant for an event
registrationsApp.post('/events/:id/register', authMiddleware, async (c) => {
  const eventId = c.req.param('id') || '';
  const user = c.get('user');

  // 1. Verify event exists and is published
  const event = await c.env.DB
    .prepare('SELECT id, title, capacity, status, start_time FROM events WHERE id = ?')
    .bind(eventId)
    .first<Event>();

  if (!event) {
    return c.json({ success: false, error: 'Event not found' }, 404);
  }

  if (event.status !== 'published') {
    return c.json({ success: false, error: `Cannot register: Event is currently ${event.status}.` }, 400);
  }

  // 2. Check if user is already actively registered
  const existingActiveReg = await c.env.DB
    .prepare("SELECT id, ticket_code FROM registrations WHERE event_id = ? AND user_id = ? AND registration_status = 'confirmed'")
    .bind(eventId, user.id)
    .first<Registration>();

  if (existingActiveReg) {
    return c.json({ 
      success: false, 
      error: 'You are already registered for this event.',
      data: { registration_id: existingActiveReg.id, ticket_code: existingActiveReg.ticket_code }
    }, 409);
  }

  // 3. Atomic capacity check and insert
  const regId = `reg-${crypto.randomUUID()}`;
  const ticketCode = generateTicketCode();
  const now = new Date().toISOString();

  try {
    const insertResult = await c.env.DB
      .prepare(`
        INSERT INTO registrations (id, event_id, user_id, ticket_code, registration_status, created_at)
        SELECT ?, ?, ?, ?, 'confirmed', ?
        WHERE (
          SELECT COUNT(*) FROM registrations 
          WHERE event_id = ? AND registration_status = 'confirmed'
        ) < (
          SELECT capacity FROM events WHERE id = ? AND status = 'published'
        )
      `)
      .bind(regId, eventId, user.id, ticketCode, now, eventId, eventId)
      .run();

    if (insertResult.meta.changes === 0) {
      return c.json({ 
        success: false, 
        error: 'Registration failed: This event has reached its maximum capacity.' 
      }, 400);
    }

    await logAudit(c.env.DB, user.id, 'REGISTRATION_CONFIRMED', 'REGISTRATION', regId);

    return c.json({
      success: true,
      message: 'Registration confirmed successfully!',
      data: {
        registration_id: regId,
        event_id: eventId,
        event_title: event.title,
        ticket_code: ticketCode,
        registration_status: 'confirmed',
        created_at: now,
      },
    }, 201);
  } catch (err: any) {
    // Catch unique constraint violation if concurrent request occurred
    if (err.message && err.message.includes('idx_registrations_active_unique')) {
      return c.json({ success: false, error: 'You are already registered for this event.' }, 409);
    }
    console.error('Registration error:', err);
    return c.json({ success: false, error: 'Registration failed due to a server error.' }, 500);
  }
});

// DELETE /api/registrations/:id - Cancel a registration
registrationsApp.delete('/registrations/:id', authMiddleware, async (c) => {
  const regId = c.req.param('id') || '';
  const user = c.get('user');

  const reg = await c.env.DB
    .prepare(`
      SELECT r.id, r.user_id, r.event_id, r.registration_status, e.organizer_id
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `)
    .bind(regId)
    .first<any>();

  if (!reg) {
    return c.json({ success: false, error: 'Registration not found' }, 404);
  }

  // Only the registering user, event organizer, or admin can cancel
  if (user.role !== 'admin' && reg.user_id !== user.id && reg.organizer_id !== user.id) {
    return c.json({ success: false, error: 'Not authorized to cancel this registration' }, 403);
  }

  if (reg.registration_status === 'cancelled') {
    return c.json({ success: false, error: 'Registration is already cancelled' }, 400);
  }

  await c.env.DB
    .prepare("UPDATE registrations SET registration_status = 'cancelled' WHERE id = ?")
    .bind(regId)
    .run();

  await logAudit(c.env.DB, user.id, 'REGISTRATION_CANCELLED', 'REGISTRATION', regId);

  return c.json({
    success: true,
    message: 'Registration cancelled successfully. Seat has been released.',
  });
});

// GET /api/registrations/my - List registrations for the authenticated participant
registrationsApp.get('/registrations/my', authMiddleware, async (c) => {
  const user = c.get('user');

  const query = `
    SELECT 
      r.id, r.event_id, r.user_id, r.ticket_code, r.registration_status, r.created_at,
      e.title as event_title, e.category as event_category, e.location as event_location,
      e.start_time as event_start_time, e.end_time as event_end_time, e.status as event_status,
      chk.checked_in_at
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    LEFT JOIN check_ins chk ON r.id = chk.registration_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;

  const results = await c.env.DB.prepare(query).bind(user.id).all<Registration>();

  return c.json({
    success: true,
    data: results.results || [],
  });
});

// GET /api/events/:id/registrations - List registrations for an event (Organizer or Admin)
registrationsApp.get('/events/:id/registrations', authMiddleware, requireRole('organizer', 'admin'), async (c) => {
  const eventId = c.req.param('id') || '';
  const user = c.get('user');

  const event = await c.env.DB
    .prepare('SELECT id, organizer_id, title FROM events WHERE id = ?')
    .bind(eventId)
    .first<Event>();

  if (!event) {
    return c.json({ success: false, error: 'Event not found' }, 404);
  }

  if (user.role !== 'admin' && event.organizer_id !== user.id) {
    return c.json({ success: false, error: 'Unauthorized to view registrations for this event' }, 403);
  }

  const query = `
    SELECT 
      r.id, r.event_id, r.user_id, r.ticket_code, r.registration_status, r.created_at,
      u.name as user_name, u.email as user_email,
      chk.checked_in_at, chk.verified_by,
      verifier.name as verified_by_name
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN check_ins chk ON r.id = chk.registration_id
    LEFT JOIN users verifier ON chk.verified_by = verifier.id
    WHERE r.event_id = ?
    ORDER BY r.created_at DESC
  `;

  const results = await c.env.DB.prepare(query).bind(eventId).all<any>();

  return c.json({
    success: true,
    data: {
      event,
      registrations: results.results || [],
    },
  });
});

export default registrationsApp;
