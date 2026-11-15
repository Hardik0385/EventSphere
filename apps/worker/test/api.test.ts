import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/index';
import { createMockD1Database } from './d1-mock';
import { Env } from '../src/types';

describe('EventSphere Serverless API Test Suite', () => {
  let env: Env;

  beforeEach(() => {
    env = {
      DB: createMockD1Database(),
      JWT_SECRET: 'test-super-secret-jwt-key-for-vitest-runs',
      ENVIRONMENT: 'test',
      ADMIN_BOOTSTRAP_SECRET: 'test-bootstrap-secret',
    };
  });

  // 1. Healthcheck
  it('GET /api/health returns database connectivity status', async () => {
    const res = await app.fetch(new Request('http://localhost/api/health'), env);
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.status).toBe('ok');
    expect(json.database).toBe('connected');
  });

  // 2. Authentication: Register, Login, Invalid Credentials
  it('POST /api/auth/register creates participant account and returns JWT', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'participant',
        }),
      }),
      env
    );

    expect(res.status).toBe(201);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.user.email).toBe('jane@example.com');
    expect(json.data.user.role).toBe('participant');
    expect(json.data.token).toBeDefined();
  });

  it('POST /api/auth/login validates credentials correctly and rejects wrong passwords', async () => {
    // 1. Register user
    await app.fetch(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Bob Smith',
          email: 'bob@example.com',
          password: 'securePassword123',
          role: 'organizer',
        }),
      }),
      env
    );

    // 2. Try invalid password
    const failRes = await app.fetch(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bob@example.com',
          password: 'wrongPassword!',
        }),
      }),
      env
    );
    expect(failRes.status).toBe(401);

    // 3. Try correct password
    const successRes = await app.fetch(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bob@example.com',
          password: 'securePassword123',
        }),
      }),
      env
    );
    expect(successRes.status).toBe(200);
    const successJson: any = await successRes.json();
    expect(successJson.success).toBe(true);
    expect(successJson.data.user.email).toBe('bob@example.com');
  });

  // 3. Event Management & Role Permissions
  it('Organizer can create, update, and manage events', async () => {
    // Register organizer
    const orgRes = await app.fetch(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Organizer Alice',
          email: 'alice@example.com',
          password: 'password123',
          role: 'organizer',
        }),
      }),
      env
    );
    const orgData: any = await orgRes.json();
    const token = orgData.data.token;

    // Create event with capacity 2
    const createRes = await app.fetch(
      new Request('http://localhost/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Cloud Summit 2026',
          description: 'A comprehensive deep dive into serverless architectures.',
          category: 'Cloud Computing',
          location: 'Hall A',
          start_time: '2026-12-01T10:00:00.000Z',
          end_time: '2026-12-01T18:00:00.000Z',
          capacity: 2,
          status: 'published',
        }),
      }),
      env
    );

    expect(createRes.status).toBe(201);
    const createData: any = await createRes.json();
    const eventId = createData.data.id;
    expect(eventId).toBeDefined();

    // Update event
    const updateRes = await app.fetch(
      new Request(`http://localhost/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: 'Grand Ballroom B',
        }),
      }),
      env
    );
    expect(updateRes.status).toBe(200);

    // Fetch updated event
    const getRes = await app.fetch(new Request(`http://localhost/api/events/${eventId}`), env);
    const getData: any = await getRes.json();
    expect(getData.data.location).toBe('Grand Ballroom B');
    expect(getData.data.capacity).toBe(2);
  });

  // 4. Registration, Capacity Enforcement, Duplicate Prevention
  it('Enforces capacity limits and prevents duplicate registrations', async () => {
    // 1. Create organizer and event with capacity = 1
    const orgRes = await app.fetch(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Organizer',
          email: 'org@test.com',
          password: 'password123',
          role: 'organizer',
        }),
      }),
      env
    );
    const orgToken = (await orgRes.json() as any).data.token;

    const eventRes = await app.fetch(
      new Request('http://localhost/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${orgToken}`,
        },
        body: JSON.stringify({
          title: 'VIP Workshop',
          description: 'Exclusive workshop with exactly 1 available seat.',
          category: 'Masterclass',
          location: 'Studio 1',
          start_time: '2026-12-05T10:00:00.000Z',
          end_time: '2026-12-05T12:00:00.000Z',
          capacity: 1, // Only 1 seat!
          status: 'published',
        }),
      }),
      env
    );
    const eventId = (await eventRes.json() as any).data.id;

    // 2. Register Participant 1
    const p1Res = await app.fetch(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Participant One',
          email: 'p1@test.com',
          password: 'password123',
          role: 'participant',
        }),
      }),
      env
    );
    const p1Token = (await p1Res.json() as any).data.token;

    // Participant 1 registers -> Success
    const reg1Res = await app.fetch(
      new Request(`http://localhost/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${p1Token}` },
      }),
      env
    );
    expect(reg1Res.status).toBe(201);
    const reg1Data: any = await reg1Res.json();
    expect(reg1Data.success).toBe(true);
    const ticketCode = reg1Data.data.ticket_code;
    expect(ticketCode).toBeDefined();

    // Participant 1 attempts duplicate registration -> 409 Conflict
    const regDuplicateRes = await app.fetch(
      new Request(`http://localhost/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${p1Token}` },
      }),
      env
    );
    expect(regDuplicateRes.status).toBe(409);

    // 3. Register Participant 2 and attempt to register -> Capacity Exceeded (400)
    const p2Res = await app.fetch(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Participant Two',
          email: 'p2@test.com',
          password: 'password123',
          role: 'participant',
        }),
      }),
      env
    );
    const p2Token = (await p2Res.json() as any).data.token;

    const reg2Res = await app.fetch(
      new Request(`http://localhost/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${p2Token}` },
      }),
      env
    );
    expect(reg2Res.status).toBe(400);
    const reg2Json: any = await reg2Res.json();
    expect(reg2Json.error).toContain('maximum capacity');

    // 4. Participant 1 cancels registration -> Seat freed up!
    const cancelRes = await app.fetch(
      new Request(`http://localhost/api/registrations/${reg1Data.data.registration_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${p1Token}` },
      }),
      env
    );
    expect(cancelRes.status).toBe(200);

    // 5. Participant 2 tries registering again now that seat is freed -> Success!
    const reg2RetryRes = await app.fetch(
      new Request(`http://localhost/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${p2Token}` },
      }),
      env
    );
    expect(reg2RetryRes.status).toBe(201);
  });

  // 5. Ticket Verification and Duplicate Check-in Prevention
  it('Verifies ticket codes and strictly prevents duplicate check-ins', async () => {
    // Bootstrap admin
    await app.fetch(
      new Request('http://localhost/api/admin/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-bootstrap-secret': 'test-bootstrap-secret',
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          name: 'Admin',
          password: 'password123',
        }),
      }),
      env
    );

    const adminLoginRes = await app.fetch(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'password123' }),
      }),
      env
    );
    const adminToken = (await adminLoginRes.json() as any).data.token;

    // Create event as admin
    const eventRes = await app.fetch(
      new Request('http://localhost/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Check-in Test Event',
          description: 'Testing verification and checkin.',
          category: 'DevOps',
          location: 'Lab 1',
          start_time: '2026-12-10T10:00:00.000Z',
          end_time: '2026-12-10T12:00:00.000Z',
          capacity: 10,
          status: 'published',
        }),
      }),
      env
    );
    const eventId = (await eventRes.json() as any).data.id;

    // Register participant
    const partRes = await app.fetch(
      new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sam Wilson',
          email: 'sam@test.com',
          password: 'password123',
          role: 'participant',
        }),
      }),
      env
    );
    const partToken = (await partRes.json() as any).data.token;

    const regRes = await app.fetch(
      new Request(`http://localhost/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${partToken}` },
      }),
      env
    );
    const ticketCode = (await regRes.json() as any).data.ticket_code;

    // Verify ticket
    const verifyRes = await app.fetch(
      new Request('http://localhost/api/tickets/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ticket_code: ticketCode }),
      }),
      env
    );
    expect(verifyRes.status).toBe(200);
    const verifyData: any = await verifyRes.json();
    expect(verifyData.valid).toBe(true);

    // First check-in -> 200 OK
    const checkinRes1 = await app.fetch(
      new Request('http://localhost/api/tickets/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ticket_code: ticketCode }),
      }),
      env
    );
    expect(checkinRes1.status).toBe(200);

    // Second check-in -> 409 Conflict (Duplicate Check-in Prevention)
    const checkinRes2 = await app.fetch(
      new Request('http://localhost/api/tickets/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ticket_code: ticketCode }),
      }),
      env
    );
    expect(checkinRes2.status).toBe(409);
    const checkin2Data: any = await checkinRes2.json();
    expect(checkin2Data.error).toContain('Duplicate check-in');
  });
});
