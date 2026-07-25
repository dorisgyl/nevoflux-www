import type { BetterAuthOptions } from 'better-auth';
import { magicLink, deviceAuthorization, jwt, bearer } from 'better-auth/plugins';
import { sendMagicLinkEmail } from '~/lib/email';

/** Shared options. `database` is the D1 binding (prod) or a sqlite Database (CLI). */
export function buildAuthOptions(env: Env, database: unknown): BetterAuthOptions {
  return {
    database: database as BetterAuthOptions['database'],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    account: { accountLinking: { enabled: true, trustedProviders: ['google', 'github'] } },
    // Cross-subdomain SSO: a session established on nevoflux.app is valid on
    // portal.nevoflux.app (remote-gateway-design.md §4b / C1). The daemon's
    // A1 device-grant + the portal share this same account system.
    advanced: {
      crossSubDomainCookies: { enabled: true, domain: '.nevoflux.app' },
    },
    trustedOrigins: ['https://nevoflux.app', 'https://portal.nevoflux.app'],
    socialProviders: {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
      github: {
        clientId: env.GITHUB_OAUTH_CLIENT_ID,
        clientSecret: env.GITHUB_OAUTH_CLIENT_SECRET,
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail(env, { email, url });
        },
      }),
      // A1 Device Authorization Grant (RFC 8628): the local daemon logs in
      // before /remote-control. Requires the deviceCode table (migration 0006).
      // NOTE: `schema: {}` works around a better-auth 1.6.20 quirk — the plugin's
      // options Zod schema marks `schema` non-optional (no `.optional()`), so
      // omitting it throws "expected nonoptional". `{}` = no table-name override.
      deviceAuthorization({
        verificationUri: '/device',
        expiresIn: '30m',
        interval: '5s',
        schema: {},
      }),
      // Short-lived JWT for Durable Object admission (N2/C2); external services
      // verify via /api/auth/jwks. Requires the jwks table (migration 0006).
      jwt({
        jwt: {
          expirationTime: '15m',
          definePayload: ({ user }) => ({ id: user.id, email: user.email }),
        },
      }),
      // Accept `Authorization: Bearer <session-token>` as session auth. Required
      // by the A1 device grant: the daemon holds no cookie jar, so it presents
      // the device-grant access_token as a bearer token to mint the DO-admission
      // JWT (`GET /api/auth/token`). Without this the endpoint 401s and
      // /remote-control fails with JWT_MINT_ERROR. Per better-auth's device
      // authorization docs, the bearer plugin is the prescribed pairing.
      // Note: bearer auth bypasses cookie CSRF protection by design; the token
      // never leaves the daemon (it is not exposed to the sidebar or the portal).
      bearer(),
      // NOTE: the apiKey plugin (headless service tokens, §4b.3) is deferred to
      // the headless phase — it is not exported from 'better-auth/plugins' in
      // 1.6.20 under that name, and A1 core (device grant + jwt) does not need it.
    ],
  };
}
