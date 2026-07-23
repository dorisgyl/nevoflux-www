-- Remote-gateway device claim table (前置-1 W4 / remote-gateway-design.md §4b N3/C3).
-- A daemon that has logged in via A1 (device grant) reports its stable device_id;
-- the claim API writes it here, owned by the authenticated account. Portal lists
-- an account's devices from this table; presence (§11) later bumps last_seen.
create table "devices" ("device_id" text not null primary key, "account_id" text not null references "user" ("id") on delete cascade, "name" text, "claimed_at" integer, "last_seen" integer);

create index "devices_account_idx" on "devices" ("account_id");
