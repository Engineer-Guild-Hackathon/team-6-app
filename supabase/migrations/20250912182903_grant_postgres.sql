grant select, insert, update, delete on table public.users to authenticated;
grant select, insert, update, delete on table public.study_sessions to authenticated;
grant select on table public.subjects to authenticated;
grant select, insert, update, delete on table public.bets to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;
grant select, insert, update, delete on table public.user_subjects to authenticated;
--  race, raceParticipantsは不要