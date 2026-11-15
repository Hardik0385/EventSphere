import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');

export function createMockD1Database(): D1Database {
  const sqlite = new DatabaseSync(':memory:');

  // Apply initial migration
  const migrationPath = path.resolve(__dirname, '../../../migrations/0001_initial_schema.sql');
  const schemaSql = fs.readFileSync(migrationPath, 'utf-8');
  sqlite.exec(schemaSql);

  const createStatement = (query: string, boundArgs: any[] = []): D1PreparedStatement => {
    return {
      bind(...args: any[]) {
        return createStatement(query, args);
      },
      async first<T = unknown>(colName?: string): Promise<T | null> {
        try {
          const stmt = sqlite.prepare(query);
          const row = stmt.get(...boundArgs) as any;
          if (!row) return null;
          if (colName) return row[colName];
          return row as T;
        } catch (err) {
          throw err;
        }
      },
      async all<T = unknown>(): Promise<D1Result<T>> {
        try {
          const stmt = sqlite.prepare(query);
          const results = stmt.all(...boundArgs) as T[];
          return {
            results,
            success: true,
            meta: {
              duration: 1,
              changes: 0,
              last_row_id: 0,
              served_by: 'node:sqlite:test',
            } as any,
          };
        } catch (err) {
          throw err;
        }
      },
      async run<T = unknown>(): Promise<D1Response> {
        try {
          const stmt = sqlite.prepare(query);
          const info = stmt.run(...boundArgs);
          return {
            success: true,
            meta: {
              duration: 1,
              changes: Number(info.changes),
              last_row_id: Number(info.lastInsertRowid),
              served_by: 'node:sqlite:test',
            } as any,
          };
        } catch (err) {
          throw err;
        }
      },
      async raw<T = unknown>(): Promise<T[]> {
        const res = await this.all<T>();
        return res.results;
      },
    } as unknown as D1PreparedStatement;
  };

  return {
    prepare(query: string) {
      return createStatement(query);
    },
    async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
      const results: D1Result<T>[] = [];
      sqlite.exec('BEGIN TRANSACTION');
      try {
        for (const stmt of statements) {
          const res = await stmt.all<T>();
          results.push(res);
        }
        sqlite.exec('COMMIT');
        return results;
      } catch (err) {
        sqlite.exec('ROLLBACK');
        throw err;
      }
    },
    async exec(query: string): Promise<D1ExecResult> {
      sqlite.exec(query);
      return { count: 1, duration: 1 };
    },
    dump(): Promise<ArrayBuffer> {
      throw new Error('dump not implemented');
    },
  } as unknown as D1Database;
}
