export async function logAudit(
  db: D1Database,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string
): Promise<void> {
  try {
    const id = `log-${crypto.randomUUID()}`;
    await db
      .prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)')
      .bind(id, actorId, action, entityType, entityId)
      .run();
  } catch (err) {
    console.error('Failed to write audit log:', err);
    // Non-blocking for primary operations
  }
}
