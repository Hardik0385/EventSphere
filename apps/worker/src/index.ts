import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env, Variables } from './types';
import authApp from './routes/auth';
import eventsApp from './routes/events';
import registrationsApp from './routes/registrations';
import ticketsApp from './routes/tickets';
import analyticsApp from './routes/analytics';
import adminApp from './routes/admin';
import healthApp from './routes/health';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Logging
app.use('*', logger());

// CORS Configuration
app.use('*', async (c, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    c.env.CORS_ORIGIN,
  ].filter(Boolean) as string[];

  const origin = c.req.header('Origin');
  const isAllowed = origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'));

  const corsMiddleware = cors({
    origin: isAllowed ? origin : (allowedOrigins[0] || '*'),
    allowHeaders: ['Content-Type', 'Authorization', 'x-admin-bootstrap-secret', 'Cache-Control'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  });

  return corsMiddleware(c, next);
});

// Centralized Error Handling
app.onError((err, c) => {
  console.error('Unhandled Application Error:', err);
  return c.json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred',
  }, 500);
});

// Centralized Not Found Handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: `Endpoint not found: ${c.req.method} ${c.req.path}`,
  }, 404);
});

// Root metadata route
app.get('/', (c) => {
  return c.json({
    name: 'EventSphere Serverless API',
    version: '1.0.0',
    platform: 'Cloudflare Workers + Cloudflare D1',
    docs: '/api/health',
  });
});

// Mount Routes
app.route('/api/health', healthApp);
app.route('/api/auth', authApp);
app.route('/api/events', eventsApp);
app.route('/api', registrationsApp);
app.route('/api/tickets', ticketsApp);
app.route('/api/analytics', analyticsApp);
app.route('/api/admin', adminApp);

export default app;
