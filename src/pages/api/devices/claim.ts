import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '~/lib/runtime';
import { getSessionUser } from '~/lib/session';
import { claimDevice } from '~/lib/devices/db';
import { jsonResponse } from '~/lib/http';

export const prerender = false;

/** POST { device_id, name? } (auth required) -> claims the device to the account. */
export const POST: APIRoute = async (ctx) => {
  const env = getRuntimeEnv(ctx.locals);
  const user = await getSessionUser(ctx.locals, ctx.request);
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401);

  let body: { device_id?: unknown; name?: unknown };
  try {
    body = await ctx.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }
  if (typeof body.device_id !== 'string' || !body.device_id.trim()) {
    return jsonResponse({ error: 'device_id is required' }, 400);
  }
  const name = typeof body.name === 'string' ? body.name : null;
  await claimDevice(env.DB, {
    deviceId: body.device_id,
    accountId: user.id,
    name,
    now: Date.now(),
  });
  return jsonResponse({ ok: true, device_id: body.device_id }, 200);
};
