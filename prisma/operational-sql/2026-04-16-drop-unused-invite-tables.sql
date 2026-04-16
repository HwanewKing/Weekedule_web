-- Operational cleanup for legacy tables that are not represented in Prisma schema.
-- Run from the Supabase SQL Editor after confirming these tables are no longer needed.

begin;

drop table if exists public."GuestParticipant";
drop table if exists public."RoomInviteToken";

commit;
