import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logAudit } from '../lib/audit';
import { VerifyTicketSchema, CheckInSchema } from '@eventsphere/shared';

const ticketsApp = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/tickets/:idOrCode - Get ticket details
ticketsApp.get('/:idOrCode', authMiddleware, async (c) => {
  const idOrCode = c.req.param('idOrCode') || '';
  const user = c.get('user');

  const query = `
    SELECT 
      r.id as registration_id, r.ticket_code, r.registration_status, r.created_at as registered_at,
      r.user_id, u.name as participant_name, u.email as participant_email,
      e.id as event_id, e.title as event_title, e.category as event_category, 
      e.location as event_location, e.start_time as event_start_time, e.end_time as event_end_time,
      e.organizer_id,
      chk.id as checkin_id, chk.checked_in_at, chk.verified_by
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    JOIN events e ON r.event_id = e.id
    LEFT JOIN check_ins chk ON r.id = chk.registration_id
    WHERE r.id = ? OR r.ticket_code = ?
  `;

  const ticket = await c.env.DB.prepare(query).bind(idOrCode, idOrCode).first<any>();

  if (!ticket) {
    return c.json({ success: false, error: 'Ticket not found' }, 404);
  }

  // Authorization check: Must be the participant, organizer of event, or admin
  if (user.role !== 'admin' && ticket.user_id !== user.id && ticket.organizer_id !== user.id) {
    return c.json({ success: false, error: 'Unauthorized to view this ticket' }, 403);
  }

  return c.json({
    success: true,
    data: ticket,
  });
});

// POST /api/tickets/verify - Verify ticket authenticity without modifying state
ticketsApp.post('/verify', authMiddleware, requireRole('organizer', 'admin'), async (c) => {
  const body = await c.req.json().catch(() => null);
  const parseResult = VerifyTicketSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid ticket code',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const { ticket_code } = parseResult.data;
  const user = c.get('user');

  const query = `
    SELECT 
      r.id as registration_id, r.ticket_code, r.registration_status, r.created_at as registered_at,
      r.user_id, u.name as participant_name, u.email as participant_email,
      e.id as event_id, e.title as event_title, e.category as event_category, 
      e.location as event_location, e.start_time as event_start_time, e.end_time as event_end_time,
      e.organizer_id,
      chk.id as checkin_id, chk.checked_in_at, chk.verified_by
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    JOIN events e ON r.event_id = e.id
    LEFT JOIN check_ins chk ON r.id = chk.registration_id
    WHERE r.ticket_code = ?
  `;

  const ticket = await c.env.DB.prepare(query).bind(ticket_code).first<any>();

  if (!ticket) {
    return c.json({
      success: false,
      valid: false,
      error: 'Ticket not found. Invalid ticket code.',
    }, 404);
  }

  // Restrict verification to the organizer of this event or admin
  if (user.role !== 'admin' && ticket.organizer_id !== user.id) {
    return c.json({
      success: false,
      valid: false,
      error: 'You are not the organizer for the event associated with this ticket.',
    }, 403);
  }

  const isConfirmed = ticket.registration_status === 'confirmed';
  const isAlreadyCheckedIn = Boolean(ticket.checked_in_at);

  return c.json({
    success: true,
    valid: isConfirmed && !isAlreadyCheckedIn,
    data: {
      ...ticket,
      is_already_checked_in: isAlreadyCheckedIn,
      status_message: !isConfirmed 
        ? 'Registration is cancelled' 
        : isAlreadyCheckedIn 
          ? `Already checked in at ${ticket.checked_in_at}` 
          : 'Valid ticket - Ready for check-in',
    },
  });
});

// POST /api/tickets/check-in - Perform participant check-in
ticketsApp.post('/check-in', authMiddleware, requireRole('organizer', 'admin'), async (c) => {
  const body = await c.req.json().catch(() => null);
  const parseResult = CheckInSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid ticket code',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const { ticket_code } = parseResult.data;
  const user = c.get('user');

  // Find registration
  const query = `
    SELECT 
      r.id as registration_id, r.ticket_code, r.registration_status,
      u.name as participant_name, u.email as participant_email,
      e.id as event_id, e.title as event_title, e.organizer_id,
      chk.id as checkin_id, chk.checked_in_at
    FROM registrations r
    JOIN users u ON r.user_id = u.id
    JOIN events e ON r.event_id = e.id
    LEFT JOIN check_ins chk ON r.id = chk.registration_id
    WHERE r.ticket_code = ?
  `;

  const ticket = await c.env.DB.prepare(query).bind(ticket_code).first<any>();

  if (!ticket) {
    return c.json({ success: false, error: 'Ticket not found. Invalid code.' }, 404);
  }

  // Restrict check-in permission to event organizer or admin
  if (user.role !== 'admin' && ticket.organizer_id !== user.id) {
    return c.json({ success: false, error: 'Unauthorized to check in participants for this event' }, 403);
  }

  if (ticket.registration_status !== 'confirmed') {
    return c.json({ success: false, error: 'Cannot check in: Registration is cancelled.' }, 400);
  }

  if (ticket.checked_in_at) {
    return c.json({
      success: false,
      error: `Duplicate check-in! Ticket was already checked in at ${ticket.checked_in_at}`,
      data: {
        registration_id: ticket.registration_id,
        checked_in_at: ticket.checked_in_at,
        participant_name: ticket.participant_name,
      },
    }, 409);
  }

  const checkinId = `chk-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  try {
    await c.env.DB
      .prepare('INSERT INTO check_ins (id, registration_id, checked_in_at, verified_by) VALUES (?, ?, ?, ?)')
      .bind(checkinId, ticket.registration_id, now, user.id)
      .run();

    await logAudit(c.env.DB, user.id, 'TICKET_CHECKIN', 'CHECK_IN', checkinId);

    return c.json({
      success: true,
      message: `Check-in successful! Welcome, ${ticket.participant_name}!`,
      data: {
        checkin_id: checkinId,
        ticket_code,
        participant_name: ticket.participant_name,
        participant_email: ticket.participant_email,
        event_title: ticket.event_title,
        checked_in_at: now,
        verified_by: user.name,
      },
    });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return c.json({
        success: false,
        error: 'Duplicate check-in! This ticket has already been checked in.',
      }, 409);
    }
    console.error('Check-in error:', err);
    return c.json({ success: false, error: 'Check-in failed due to server error' }, 500);
  }
});

export default ticketsApp;
