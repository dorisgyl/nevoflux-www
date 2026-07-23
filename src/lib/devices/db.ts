/** A claimed remote-control device (migration 0007). Timestamps are epoch ms. */
export interface DeviceRow {
  device_id: string;
  account_id: string;
  name: string | null;
  claimed_at: number | null;
  last_seen: number | null;
}

/**
 * Claim (upsert) a device to an account. First claim sets `claimed_at` +
 * `last_seen`; re-claim (same device_id) refreshes `last_seen` and, if a name
 * is supplied, the name — and re-binds `account_id` (a machine re-logged-in
 * under a different account re-pairs). Gated by the API requiring a session.
 */
export async function claimDevice(
  db: D1Database,
  input: { deviceId: string; accountId: string; name?: string | null; now: number }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO devices (device_id, account_id, name, claimed_at, last_seen)
       VALUES (?1, ?2, ?3, ?4, ?4)
       ON CONFLICT(device_id) DO UPDATE SET
         account_id = ?2,
         name = COALESCE(?3, devices.name),
         last_seen = ?4`
    )
    .bind(input.deviceId, input.accountId, input.name ?? null, input.now)
    .run();
}

/** List devices claimed by an account, most-recently-seen first. */
export async function listDevices(db: D1Database, accountId: string): Promise<DeviceRow[]> {
  const res = await db
    .prepare('SELECT * FROM devices WHERE account_id = ?1 ORDER BY last_seen DESC')
    .bind(accountId)
    .all<DeviceRow>();
  return res.results ?? [];
}
