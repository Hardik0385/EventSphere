import { Hono } from 'hono';
import { Env } from '../types';
import { HealthResponse } from '@eventsphere/shared';

const healthApp = new Hono<{ Bindings: Env }>();

healthApp.get('/', async (c) => {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    const testResult = await c.env.DB.prepare('SELECT 1 as test').first<{ test: number }>();
    if (testResult && testResult.test === 1) {
      dbStatus = 'connected';
    }
  } catch (err) {
    console.error('Healthcheck DB error:', err);
    dbStatus = 'disconnected';
  }

  // Cloudflare edge colo (airport code of edge datacenter e.g. BOM, DEL, SFO)
  const cf = (c.req.raw as any).cf;
  const edgeColo = cf?.colo || 'Localhost / Dev Worker';

  const response: HealthResponse = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    environment: c.env.ENVIRONMENT || 'development',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    serverless_edge_region: edgeColo,
    version: '1.0.0',
  };

  return c.json(response, dbStatus === 'connected' ? 200 : 503);
});

export default healthApp;
