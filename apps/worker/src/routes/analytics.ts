import { Hono } from 'hono';
import { Env, Variables } from '../types';
import { authMiddleware, requireRole } from '../middleware/auth';
import { OrganizerStats, AdminStats, SingleEventAnalytics, Event } from '@eventsphere/shared';

const analyticsApp = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/analytics/organizer - Metrics for organizer's events
analyticsApp.get('/organizer', authMiddleware, requireRole('organizer', 'admin'), async (c) => {
  const user = c.get('user');

  // Query events managed by this organizer
  const events = await c.env.DB
    .prepare(`
      SELECT 
        e.*, 
        COALESCE(r.reg_count, 0) as confirmed_registrations_count,
        COALESCE(chk.checkin_count, 0) as checkins_count
      FROM events e
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
      WHERE e.organizer_id = ?
      ORDER BY e.start_time ASC
    `)
    .bind(user.id)
    .all<any>();

  const eventList = events.results || [];
  const totalEvents = eventList.length;
  const activeEvents = eventList.filter((e) => e.status === 'published').length;

  let totalRegistrations = 0;
  let totalCheckins = 0;
  let totalCapacity = 0;

  const eventAttendanceBreakdown = eventList.map((e) => {
    const regCount = Number(e.confirmed_registrations_count) || 0;
    const chkCount = Number(e.checkins_count) || 0;
    totalRegistrations += regCount;
    totalCheckins += chkCount;
    totalCapacity += Number(e.capacity) || 0;

    return {
      title: e.title,
      registered: regCount,
      checked_in: chkCount,
      capacity: Number(e.capacity),
    };
  });

  const attendanceRate = totalRegistrations > 0 
    ? Math.round((totalCheckins / totalRegistrations) * 100) 
    : 0;

  const capacityUtilization = totalCapacity > 0 
    ? Math.round((totalRegistrations / totalCapacity) * 100) 
    : 0;

  // Registration trends grouped by date for organizer's events
  const trendsResult = await c.env.DB
    .prepare(`
      SELECT substr(r.created_at, 1, 10) as date, COUNT(*) as count
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE e.organizer_id = ? AND r.registration_status = 'confirmed'
      GROUP BY substr(r.created_at, 1, 10)
      ORDER BY date ASC
      LIMIT 30
    `)
    .bind(user.id)
    .all<{ date: string; count: number }>();

  const upcomingEvents = eventList
    .filter((e) => new Date(e.start_time) >= new Date())
    .slice(0, 5);

  const stats: OrganizerStats = {
    total_events: totalEvents,
    active_events: activeEvents,
    total_registrations: totalRegistrations,
    total_checkins: totalCheckins,
    attendance_rate: attendanceRate,
    capacity_utilization: capacityUtilization,
    upcoming_events: upcomingEvents,
    registration_trends: trendsResult.results || [],
    event_attendance_breakdown: eventAttendanceBreakdown,
  };

  return c.json({
    success: true,
    data: stats,
  });
});

// GET /api/analytics/admin - Platform-wide statistics
analyticsApp.get('/admin', authMiddleware, requireRole('admin'), async (c) => {
  // 1. User counts
  const userCounts = await c.env.DB
    .prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as total_organizers,
        SUM(CASE WHEN role = 'participant' THEN 1 ELSE 0 END) as total_participants
      FROM users
    `)
    .first<any>();

  // 2. Events & Registrations summary
  const eventCounts = await c.env.DB
    .prepare('SELECT COUNT(*) as total_events FROM events')
    .first<{ total_events: number }>();

  const regCounts = await c.env.DB
    .prepare(`
      SELECT 
        COUNT(*) as total_registrations,
        SUM(CASE WHEN registration_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_registrations
      FROM registrations
    `)
    .first<any>();

  const checkinCounts = await c.env.DB
    .prepare('SELECT COUNT(*) as total_checkins FROM check_ins')
    .first<{ total_checkins: number }>();

  // 3. Registrations over time
  const timeTrends = await c.env.DB
    .prepare(`
      SELECT substr(created_at, 1, 10) as date, COUNT(*) as count
      FROM registrations
      WHERE registration_status = 'confirmed'
      GROUP BY substr(created_at, 1, 10)
      ORDER BY date ASC
      LIMIT 30
    `)
    .all<{ date: string; count: number }>();

  // 4. Events grouped by category
  const categories = await c.env.DB
    .prepare(`
      SELECT category, COUNT(*) as count
      FROM events
      GROUP BY category
      ORDER BY count DESC
    `)
    .all<{ category: string; count: number }>();

  // 5. Recent events
  const recentEvents = await c.env.DB
    .prepare(`
      SELECT e.*, u.name as organizer_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `)
    .all<Event>();

  // 6. Recent audit logs
  const auditLogs = await c.env.DB
    .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10')
    .all<any>();

  const totalConfirmed = Number(regCounts?.confirmed_registrations) || 0;
  const totalCheckins = Number(checkinCounts?.total_checkins) || 0;
  const overallAttendance = totalConfirmed > 0 
    ? Math.round((totalCheckins / totalConfirmed) * 100) 
    : 0;

  const stats: AdminStats = {
    total_users: Number(userCounts?.total_users) || 0,
    total_organizers: Number(userCounts?.total_organizers) || 0,
    total_participants: Number(userCounts?.total_participants) || 0,
    total_events: Number(eventCounts?.total_events) || 0,
    total_registrations: totalConfirmed,
    total_checkins: totalCheckins,
    overall_attendance_rate: overallAttendance,
    registrations_over_time: timeTrends.results || [],
    events_by_category: categories.results || [],
    recent_events: recentEvents.results || [],
    recent_activity: auditLogs.results || [],
  };

  return c.json({
    success: true,
    data: stats,
  });
});

// GET /api/analytics/events/:id - Detailed metrics for a single event
analyticsApp.get('/events/:id', authMiddleware, requireRole('organizer', 'admin'), async (c) => {
  const eventId = c.req.param('id') || '';
  const user = c.get('user');

  const event = await c.env.DB
    .prepare('SELECT * FROM events WHERE id = ?')
    .bind(eventId)
    .first<Event>();

  if (!event) {
    return c.json({ success: false, error: 'Event not found' }, 404);
  }

  if (user.role !== 'admin' && event.organizer_id !== user.id) {
    return c.json({ success: false, error: 'Unauthorized' }, 403);
  }

  const regStats = await c.env.DB
    .prepare(`
      SELECT 
        COUNT(*) as total_registrations,
        SUM(CASE WHEN chk.id IS NOT NULL THEN 1 ELSE 0 END) as total_checkins
      FROM registrations r
      LEFT JOIN check_ins chk ON r.id = chk.registration_id
      WHERE r.event_id = ? AND r.registration_status = 'confirmed'
    `)
    .bind(eventId)
    .first<any>();

  const timeline = await c.env.DB
    .prepare(`
      SELECT substr(created_at, 1, 10) as date, COUNT(*) as count
      FROM registrations
      WHERE event_id = ? AND registration_status = 'confirmed'
      GROUP BY substr(created_at, 1, 10)
      ORDER BY date ASC
    `)
    .bind(eventId)
    .all<{ date: string; count: number }>();

  const totalReg = Number(regStats?.total_registrations) || 0;
  const totalChk = Number(regStats?.total_checkins) || 0;
  const attendanceRate = totalReg > 0 ? Math.round((totalChk / totalReg) * 100) : 0;
  const capacityUtilization = event.capacity > 0 ? Math.round((totalReg / event.capacity) * 100) : 0;

  const result: SingleEventAnalytics = {
    event,
    total_registrations: totalReg,
    total_checkins: totalChk,
    attendance_rate: attendanceRate,
    capacity_utilization: capacityUtilization,
    registrations_timeline: timeline.results || [],
  };

  return c.json({
    success: true,
    data: result,
  });
});

export default analyticsApp;
