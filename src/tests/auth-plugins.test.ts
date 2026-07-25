import { describe, it, expect } from 'vitest';
import { buildAuthOptions } from '~/lib/auth-options';

// Minimal env stub — buildAuthOptions only reads these fields and assigns
// `database`; it does no I/O, so inspecting the returned options is pure.
const mockEnv = {
  BETTER_AUTH_SECRET: 'test-secret',
  BETTER_AUTH_URL: 'https://nevoflux.app',
  GOOGLE_CLIENT_ID: 'g',
  GOOGLE_CLIENT_SECRET: 'gs',
  GITHUB_OAUTH_CLIENT_ID: 'gh',
  GITHUB_OAUTH_CLIENT_SECRET: 'ghs',
  RESEND_API_KEY: 'r',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('buildAuthOptions — account/device-grant config (remote-gateway §4b)', () => {
  const opts = buildAuthOptions(mockEnv, {});

  it('enables cross-subdomain cookies on .nevoflux.app', () => {
    expect(opts.advanced?.crossSubDomainCookies).toEqual({
      enabled: true,
      domain: '.nevoflux.app',
    });
  });

  it('trusts the portal origin for cross-subdomain SSO', () => {
    expect(opts.trustedOrigins).toContain('https://portal.nevoflux.app');
  });

  it('registers magicLink + deviceAuthorization + jwt + bearer (4 plugins; apiKey deferred to headless)', () => {
    expect(opts.plugins).toHaveLength(4);
    const ids = (opts.plugins ?? []).map((p) => (p as { id?: string }).id);
    expect(ids).toContain('device-authorization');
  });

  it('registers bearer so the device-grant token can authenticate API calls', () => {
    // Without this the daemon's `GET /api/auth/token` (Authorization: Bearer
    // <device-grant access_token>) 401s and /remote-control dies with
    // JWT_MINT_ERROR — better-auth only reads bearer tokens via this plugin.
    const ids = (opts.plugins ?? []).map((p) => (p as { id?: string }).id);
    expect(ids).toContain('bearer');
  });
});
