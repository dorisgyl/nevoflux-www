-- better-auth plugin tables for the remote-gateway A1 device grant (前置-1 W1).
-- Field definitions transcribed faithfully from the installed better-auth
-- 1.6.20 plugin schemas:
--   deviceCode: node_modules/better-auth/dist/plugins/device-authorization/schema.mjs
--   jwks:       node_modules/better-auth/dist/plugins/jwt/schema.mjs
-- `id` is the implicit primary key better-auth adds to every model (cf. 0001).
-- Type mapping matches 0001_better_auth.sql: string->text, date->date, number->integer.
-- (apiKey plugin table is intentionally omitted — deferred to the headless phase.)

create table "deviceCode" ("id" text not null primary key, "deviceCode" text not null, "userCode" text not null, "userId" text, "expiresAt" date not null, "status" text not null, "lastPolledAt" date, "pollingInterval" integer, "clientId" text, "scope" text);

create table "jwks" ("id" text not null primary key, "publicKey" text not null, "privateKey" text not null, "createdAt" date not null, "expiresAt" date);

-- Device authorization polls by deviceCode and looks up by userCode on approval;
-- both are hot lookup keys, so index them (perf addition beyond the base schema).
create index "deviceCode_deviceCode_idx" on "deviceCode" ("deviceCode");

create index "deviceCode_userCode_idx" on "deviceCode" ("userCode");
