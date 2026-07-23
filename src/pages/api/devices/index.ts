import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '~/lib/runtime';
import { getSessionUser } from '~/lib/session';
import { listDevices } from '~/lib/devices/db';
import { jsonResponse } from '~/lib/http';

export const prerender = false;

/** GET (auth required) -> the caller account's claimed devices. */
export const GET: APIRoute = async (ctx) => {
  const env = getRuntimeEnv(ctx.locals);
  const user = await getSessionUser(ctx.locals, ctx.request);
  if (!user) return jsonResponse({ error: 'Authentication required' }, 401);
  const devices = await listDevices(env.DB, user.id);
  return jsonResponse({ devices }, 200);
};
