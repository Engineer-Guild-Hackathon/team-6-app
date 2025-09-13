grant select, insert, update, delete on table public.races to anon;
grant select, insert, update, delete on table public.race_participants to anon;
grant select, insert, update, delete on table public.races to authenticated;
grant select, insert, update, delete on table public.race_participants to authenticated;
--  race, raceParticipantsは必要だった