import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { authMiddleware, optionalAuthMiddleware, requireRole } from '../middleware/auth';
import { logAudit } from '../lib/audit';
import { CreateEventSchema, UpdateEventSchema, Event } from '@eventsphere/shared';

const eventsApp = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/events - List events with search, category filtering and real-time capacity calculations
eventsApp.get('/', optionalAuthMiddleware, async (c) => {
  const user = c.get('user');
  const search = c.req.query('search')?.trim();
  const category = c.req.query('category')?.trim();
  const status = c.req.query('status')?.trim();
  const organizerId = c.req.query('organizer_id')?.trim();
  const upcomingOnly = c.req.query('upcoming') === 'true';

  let query = `
    SELECT 
      e.id, e.organizer_id, e.title, e.description, e.category, e.location,
      e.start_time, e.end_time, e.capacity, e.status, e.created_at, e.updated_at,
      u.name as organizer_name, u.email as organizer_email,
      COALESCE(r.reg_count, 0) as confirmed_registrations_count,
      (e.capacity - COALESCE(r.reg_count, 0)) as remaining_capacity
      ${user ? ', CASE WHEN my_reg.id IS NOT NULL THEN 1 ELSE 0 END as is_user_registered' : ', 0 as is_user_registered'}
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    LEFT JOIN (
      SELECT event_id, COUNT(*) as reg_count 
      FROM registrations 
      WHERE registration_status = 'confirmed' 
      GROUP BY event_id
    ) r ON e.id = r.event_id
  `;

  if (user) {
    query += `
      LEFT JOIN (
        SELECT id, event_id FROM registrations
        WHERE user_id = '${user.id}' AND registration_status = 'confirmed'
      ) my_reg ON e.id = my_reg.event_id
    `;
  }

  const conditions: string[] = [];
  const params: unknown[] = [];

  // Default to published unless filtering by organizer or admin
  if (status) {
    conditions.push('e.status = ?');
    params.push(status);
  } else if (!organizerId) {
    conditions.push("e.status = 'published'");
  }

  if (category) {
    conditions.push('e.category = ?');
    params.push(category);
  }

  if (organizerId) {
    conditions.push('e.organizer_id = ?');
    params.push(organizerId);
  }

  if (search) {
    conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (upcomingOnly) {
    conditions.push("e.start_time >= datetime('now')");
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY e.start_time ASC';

  const stmt = c.env.DB.prepare(query);
  const results = await (params.length > 0 ? stmt.bind(...params) : stmt).all<Event>();

  // Format boolean fields properly
  const formattedEvents = (results.results || []).map((evt: any) => ({
    ...evt,
    is_user_registered: Boolean(evt.is_user_registered),
    remaining_capacity: Math.max(0, evt.remaining_capacity),
  }));

  return c.json({
    success: true,
    data: formattedEvents,
  });
});

// GET /api/events/:id - Get single event details
eventsApp.get('/:id', optionalAuthMiddleware, async (c) => {
  const id = c.req.param('id') || '';
  const user = c.get('user');

  let query = `
    SELECT 
      e.id, e.organizer_id, e.title, e.description, e.category, e.location,
      e.start_time, e.end_time, e.capacity, e.status, e.created_at, e.updated_at,
      u.name as organizer_name, u.email as organizer_email,
      COALESCE(r.reg_count, 0) as confirmed_registrations_count,
      (e.capacity - COALESCE(r.reg_count, 0)) as remaining_capacity
      ${user ? ', CASE WHEN my_reg.id IS NOT NULL THEN 1 ELSE 0 END as is_user_registered' : ', 0 as is_user_registered'}
    FROM events e
    LEFT JOIN users u ON e.organizer_id = u.id
    LEFT JOIN (
      SELECT event_id, COUNT(*) as reg_count 
      FROM registrations 
      WHERE registration_status = 'confirmed' 
      GROUP BY event_id
    ) r ON e.id = r.event_id
  `;

  if (user) {
    query += `
      LEFT JOIN (
        SELECT id, event_id FROM registrations
        WHERE user_id = '${user.id}' AND registration_status = 'confirmed'
      ) my_reg ON e.id = my_reg.event_id
    `;
  }

  query += ' WHERE e.id = ?';

  const event = await c.env.DB.prepare(query).bind(id).first<any>();

  if (!event) {
    return c.json({ success: false, error: 'Event not found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...event,
      is_user_registered: Boolean(event.is_user_registered),
      remaining_capacity: Math.max(0, event.remaining_capacity),
    },
  });
});

// POST /api/events - Create new event (Organizer / Admin)
eventsApp.post('/', authMiddleware, requireRole('organizer', 'admin'), async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => null);
  const parseResult = CreateEventSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid event data',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const { title, description, category, location, start_time, end_time, capacity, status } = parseResult.data;
  const eventId = `evt-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  await c.env.DB
    .prepare(`
      INSERT INTO events (id, organizer_id, title, description, category, location, start_time, end_time, capacity, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(eventId, user.id, title, description, category, location, start_time, end_time, capacity, status, now, now)
    .run();

  await logAudit(c.env.DB, user.id, 'EVENT_CREATED', 'EVENT', eventId);

  const createdEvent: Event = {
    id: eventId,
    organizer_id: user.id,
    title,
    description,
    category,
    location,
    start_time,
    end_time,
    capacity,
    status,
    created_at: now,
    updated_at: now,
    organizer_name: user.name,
    confirmed_registrations_count: 0,
    remaining_capacity: capacity,
    is_user_registered: false,
  };

  return c.json({
    success: true,
    message: 'Event created successfully',
    data: createdEvent,
  }, 201);
});

// PUT /api/events/:id - Update event (Organizer who owns it, or Admin)
eventsApp.put('/:id', authMiddleware, requireRole('organizer', 'admin'), async (c) => {
  const id = c.req.param('id') || '';
  const user = c.get('user');

  const existingEvent = await c.env.DB
    .prepare('SELECT id, organizer_id FROM events WHERE id = ?')
    .bind(id)
    .first<Event>();

  if (!existingEvent) {
    return c.json({ success: false, error: 'Event not found' }, 404);
  }

  // Restrict to event organizer or admin
  if (user.role !== 'admin' && existingEvent.organizer_id !== user.id) {
    return c.json({ success: false, error: 'You are not authorized to edit this event' }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const parseResult = UpdateEventSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      success: false,
      error: 'Invalid update data',
      errors: parseResult.error.flatten().fieldErrors,
    }, 400);
  }

  const data = parseResult.data;
  const updates: string[] = [];
  const params: unknown[] = [];

  if (data.title !== undefined) { updates.push('title = ?'); params.push(data.title); }
  if (data.description !== undefined) { updates.push('description = ?'); params.push(data.description); }
  if (data.category !== undefined) { updates.push('category = ?'); params.push(data.category); }
  if (data.location !== undefined) { updates.push('location = ?'); params.push(data.location); }
  if (data.start_time !== undefined) { updates.push('start_time = ?'); params.push(data.start_time); }
  if (data.end_time !== undefined) { updates.push('end_time = ?'); params.push(data.end_time); }
  if (data.capacity !== undefined) { updates.push('capacity = ?'); params.push(data.capacity); }
  if (data.status !== undefined) { updates.push('status = ?'); params.push(data.status); }

  if (updates.length === 0) {
    return c.json({ success: false, error: 'No fields to update' }, 400);
  }

  const now = new Date().toISOString();
  updates.push('updated_at = ?');
  params.push(now);

  params.push(id);

  await c.env.DB
    .prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();

  await logAudit(c.env.DB, user.id, 'EVENT_UPDATED', 'EVENT', id);

  return c.json({
    success: true,
    message: 'Event updated successfully',
  });
});

// DELETE /api/events/:id - Delete or Cancel event
eventsApp.delete('/:id', authMiddleware, requireRole('organizer', 'admin'), async (c) => {
  const id = c.req.param('id') || '';
  const user = c.get('user');

  const existingEvent = await c.env.DB
    .prepare('SELECT id, organizer_id FROM events WHERE id = ?')
    .bind(id)
    .first<Event>();

  if (!existingEvent) {
    return c.json({ success: false, error: 'Event not found' }, 404);
  }

  if (user.role !== 'admin' && existingEvent.organizer_id !== user.id) {
    return c.json({ success: false, error: 'You are not authorized to delete this event' }, 403);
  }

  await c.env.DB
    .prepare('DELETE FROM events WHERE id = ?')
    .bind(id)
    .run();

  await logAudit(c.env.DB, user.id, 'EVENT_DELETED', 'EVENT', id);

  return c.json({
    success: true,
    message: 'Event deleted successfully',
  });
});

export default eventsApp;
