import { describe, it, expect } from 'vitest';
import { claimDevice, listDevices } from '~/lib/devices/db';

/** Minimal D1 stub recording prepare/bind calls (www has no live-D1 test infra;
 *  existing tests exercise pure logic — this validates SQL + bindings). */
function mockDb(allResults: unknown[] = []) {
  const calls: { sql: string; args: unknown[] }[] = [];
  const prepare = (sql: string) => ({
    bind: (...args: unknown[]) => {
      calls.push({ sql, args });
      return {
        run: async () => ({ success: true }),
        all: async () => ({ results: allResults }),
        first: async () => allResults[0] ?? null,
      };
    },
  });
  return { db: { prepare } as unknown as D1Database, calls };
}

describe('devices db helpers (前置-1 W4)', () => {
  it('claimDevice upserts with device_id, account_id, name, now', async () => {
    const { db, calls } = mockDb();
    await claimDevice(db, { deviceId: 'dev-1', accountId: 'acc-1', name: 'Laptop', now: 1234 });
    expect(calls).toHaveLength(1);
    expect(calls[0].sql).toContain('INSERT INTO devices');
    expect(calls[0].sql).toContain('ON CONFLICT');
    expect(calls[0].args).toEqual(['dev-1', 'acc-1', 'Laptop', 1234]);
  });

  it('claimDevice passes null name when omitted', async () => {
    const { db, calls } = mockDb();
    await claimDevice(db, { deviceId: 'dev-2', accountId: 'acc-1', now: 99 });
    expect(calls[0].args).toEqual(['dev-2', 'acc-1', null, 99]);
  });

  it('listDevices queries by account and returns rows', async () => {
    const rows = [
      { device_id: 'dev-1', account_id: 'acc-1', name: 'L', claimed_at: 1, last_seen: 2 },
    ];
    const { db, calls } = mockDb(rows);
    const out = await listDevices(db, 'acc-1');
    expect(calls[0].sql).toContain('WHERE account_id = ?1');
    expect(calls[0].args).toEqual(['acc-1']);
    expect(out).toEqual(rows);
  });

  it('listDevices returns [] when D1 yields no results field', async () => {
    const db = {
      prepare: () => ({ bind: () => ({ all: async () => ({}) }) }),
    } as unknown as D1Database;
    expect(await listDevices(db, 'acc-x')).toEqual([]);
  });
});
