drop policy "Enable read access for users based on user_id" on "public"."users";

revoke delete on table "public"."bets" from "anon";

revoke insert on table "public"."bets" from "anon";

revoke references on table "public"."bets" from "anon";

revoke select on table "public"."bets" from "anon";

revoke trigger on table "public"."bets" from "anon";

revoke truncate on table "public"."bets" from "anon";

revoke update on table "public"."bets" from "anon";

revoke delete on table "public"."bets" from "authenticated";

revoke insert on table "public"."bets" from "authenticated";

revoke references on table "public"."bets" from "authenticated";

revoke select on table "public"."bets" from "authenticated";

revoke trigger on table "public"."bets" from "authenticated";

revoke truncate on table "public"."bets" from "authenticated";

revoke update on table "public"."bets" from "authenticated";

revoke delete on table "public"."bets" from "service_role";

revoke insert on table "public"."bets" from "service_role";

revoke references on table "public"."bets" from "service_role";

revoke select on table "public"."bets" from "service_role";

revoke trigger on table "public"."bets" from "service_role";

revoke truncate on table "public"."bets" from "service_role";

revoke update on table "public"."bets" from "service_role";

revoke delete on table "public"."race_participants" from "anon";

revoke insert on table "public"."race_participants" from "anon";

revoke references on table "public"."race_participants" from "anon";

revoke select on table "public"."race_participants" from "anon";

revoke trigger on table "public"."race_participants" from "anon";

revoke truncate on table "public"."race_participants" from "anon";

revoke update on table "public"."race_participants" from "anon";

revoke delete on table "public"."race_participants" from "authenticated";

revoke insert on table "public"."race_participants" from "authenticated";

revoke references on table "public"."race_participants" from "authenticated";

revoke select on table "public"."race_participants" from "authenticated";

revoke trigger on table "public"."race_participants" from "authenticated";

revoke truncate on table "public"."race_participants" from "authenticated";

revoke update on table "public"."race_participants" from "authenticated";

revoke delete on table "public"."race_participants" from "service_role";

revoke insert on table "public"."race_participants" from "service_role";

revoke references on table "public"."race_participants" from "service_role";

revoke select on table "public"."race_participants" from "service_role";

revoke trigger on table "public"."race_participants" from "service_role";

revoke truncate on table "public"."race_participants" from "service_role";

revoke update on table "public"."race_participants" from "service_role";

revoke delete on table "public"."races" from "anon";

revoke insert on table "public"."races" from "anon";

revoke references on table "public"."races" from "anon";

revoke select on table "public"."races" from "anon";

revoke trigger on table "public"."races" from "anon";

revoke truncate on table "public"."races" from "anon";

revoke update on table "public"."races" from "anon";

revoke delete on table "public"."races" from "authenticated";

revoke insert on table "public"."races" from "authenticated";

revoke references on table "public"."races" from "authenticated";

revoke select on table "public"."races" from "authenticated";

revoke trigger on table "public"."races" from "authenticated";

revoke truncate on table "public"."races" from "authenticated";

revoke update on table "public"."races" from "authenticated";

revoke delete on table "public"."races" from "service_role";

revoke insert on table "public"."races" from "service_role";

revoke references on table "public"."races" from "service_role";

revoke select on table "public"."races" from "service_role";

revoke trigger on table "public"."races" from "service_role";

revoke truncate on table "public"."races" from "service_role";

revoke update on table "public"."races" from "service_role";

revoke delete on table "public"."study_sessions" from "anon";

revoke insert on table "public"."study_sessions" from "anon";

revoke references on table "public"."study_sessions" from "anon";

revoke select on table "public"."study_sessions" from "anon";

revoke trigger on table "public"."study_sessions" from "anon";

revoke truncate on table "public"."study_sessions" from "anon";

revoke update on table "public"."study_sessions" from "anon";

revoke delete on table "public"."study_sessions" from "authenticated";

revoke insert on table "public"."study_sessions" from "authenticated";

revoke references on table "public"."study_sessions" from "authenticated";

revoke select on table "public"."study_sessions" from "authenticated";

revoke trigger on table "public"."study_sessions" from "authenticated";

revoke truncate on table "public"."study_sessions" from "authenticated";

revoke update on table "public"."study_sessions" from "authenticated";

revoke delete on table "public"."study_sessions" from "service_role";

revoke insert on table "public"."study_sessions" from "service_role";

revoke references on table "public"."study_sessions" from "service_role";

revoke select on table "public"."study_sessions" from "service_role";

revoke trigger on table "public"."study_sessions" from "service_role";

revoke truncate on table "public"."study_sessions" from "service_role";

revoke update on table "public"."study_sessions" from "service_role";

revoke delete on table "public"."subjects" from "anon";

revoke insert on table "public"."subjects" from "anon";

revoke references on table "public"."subjects" from "anon";

revoke select on table "public"."subjects" from "anon";

revoke trigger on table "public"."subjects" from "anon";

revoke truncate on table "public"."subjects" from "anon";

revoke update on table "public"."subjects" from "anon";

revoke delete on table "public"."subjects" from "authenticated";

revoke insert on table "public"."subjects" from "authenticated";

revoke references on table "public"."subjects" from "authenticated";

revoke select on table "public"."subjects" from "authenticated";

revoke trigger on table "public"."subjects" from "authenticated";

revoke truncate on table "public"."subjects" from "authenticated";

revoke update on table "public"."subjects" from "authenticated";

revoke delete on table "public"."subjects" from "service_role";

revoke insert on table "public"."subjects" from "service_role";

revoke references on table "public"."subjects" from "service_role";

revoke select on table "public"."subjects" from "service_role";

revoke trigger on table "public"."subjects" from "service_role";

revoke truncate on table "public"."subjects" from "service_role";

revoke update on table "public"."subjects" from "service_role";

revoke delete on table "public"."transactions" from "anon";

revoke insert on table "public"."transactions" from "anon";

revoke references on table "public"."transactions" from "anon";

revoke select on table "public"."transactions" from "anon";

revoke trigger on table "public"."transactions" from "anon";

revoke truncate on table "public"."transactions" from "anon";

revoke update on table "public"."transactions" from "anon";

revoke delete on table "public"."transactions" from "authenticated";

revoke insert on table "public"."transactions" from "authenticated";

revoke references on table "public"."transactions" from "authenticated";

revoke select on table "public"."transactions" from "authenticated";

revoke trigger on table "public"."transactions" from "authenticated";

revoke truncate on table "public"."transactions" from "authenticated";

revoke update on table "public"."transactions" from "authenticated";

revoke delete on table "public"."transactions" from "service_role";

revoke insert on table "public"."transactions" from "service_role";

revoke references on table "public"."transactions" from "service_role";

revoke select on table "public"."transactions" from "service_role";

revoke trigger on table "public"."transactions" from "service_role";

revoke truncate on table "public"."transactions" from "service_role";

revoke update on table "public"."transactions" from "service_role";

revoke delete on table "public"."user_subjects" from "anon";

revoke insert on table "public"."user_subjects" from "anon";

revoke references on table "public"."user_subjects" from "anon";

revoke select on table "public"."user_subjects" from "anon";

revoke trigger on table "public"."user_subjects" from "anon";

revoke truncate on table "public"."user_subjects" from "anon";

revoke update on table "public"."user_subjects" from "anon";

revoke delete on table "public"."user_subjects" from "authenticated";

revoke insert on table "public"."user_subjects" from "authenticated";

revoke references on table "public"."user_subjects" from "authenticated";

revoke select on table "public"."user_subjects" from "authenticated";

revoke trigger on table "public"."user_subjects" from "authenticated";

revoke truncate on table "public"."user_subjects" from "authenticated";

revoke update on table "public"."user_subjects" from "authenticated";

revoke delete on table "public"."user_subjects" from "service_role";

revoke insert on table "public"."user_subjects" from "service_role";

revoke references on table "public"."user_subjects" from "service_role";

revoke select on table "public"."user_subjects" from "service_role";

revoke trigger on table "public"."user_subjects" from "service_role";

revoke truncate on table "public"."user_subjects" from "service_role";

revoke update on table "public"."user_subjects" from "service_role";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

revoke delete on table "public"."users" from "service_role";

revoke insert on table "public"."users" from "service_role";

revoke references on table "public"."users" from "service_role";

revoke select on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

revoke update on table "public"."users" from "service_role";

alter table "public"."users" drop constraint "users_email_key";

drop index if exists "public"."users_email_key";

alter table "public"."bets" enable row level security;

alter table "public"."race_participants" enable row level security;

alter table "public"."races" enable row level security;

alter table "public"."study_sessions" enable row level security;

alter table "public"."subjects" enable row level security;

alter table "public"."transactions" enable row level security;

alter table "public"."user_subjects" enable row level security;

alter table "public"."users" drop column "email";

alter table "public"."users" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_study_session_transaction(p_user_id uuid, p_subject_id uuid, p_duration integer, p_bet_coins_earned integer, p_comment text, p_date timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
    v_current_balance integer;
begin
    -- 1. 現在のユーザーのベットコインを取得
    select bet_coins into v_current_balance
    from users
    where id = p_user_id
    for update; -- 排他ロック

    if not found then
        raise exception 'ユーザーが存在しません: %', p_user_id;
    end if;

    -- 2. study_sessions に挿入
    insert into study_sessions(
        user_id,
        subject_id,
        comment,
        duration,
        bet_coins_earned,
        date,
        created_at
    ) values (
        p_user_id,
        p_subject_id,
        p_comment,
        p_duration,
        p_bet_coins_earned,
        p_date,
        now()
    );

    -- 3. transactions に挿入
    insert into transactions(
        user_id,
        type,
        amount,
        balance_after,
        created_at
    ) values (
        p_user_id,
        'study_reward',
        p_bet_coins_earned,
        v_current_balance + p_bet_coins_earned,
        now()
    );

    -- 4. users のベットコインと勉強時間を更新
    update users
    set 
        bet_coins = bet_coins + p_bet_coins_earned,
        total_study_time = total_study_time + p_duration,
        current_week_study_time = current_week_study_time + p_duration,
        updated_at = now()
    where id = p_user_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.place_bet(p_user_id uuid, p_race_id uuid, p_participant_id uuid, p_bet_type bet_type, p_amount integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  -- basic validation
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  -- ロックして現在の残高を取得
  SELECT bet_coins INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_balance';
  END IF;

  -- 1) bets テーブルに挿入
  INSERT INTO bets (user_id, race_id, participant_id, type, amount)
  VALUES (p_user_id, p_race_id, p_participant_id, p_bet_type, p_amount);

  -- 2) users の残高を減らす
  v_new_balance := v_current_balance - p_amount;
  UPDATE users
  SET bet_coins = v_new_balance, updated_at = now()
  WHERE id = p_user_id;

  -- 3) transactions に履歴を残す（ベットで支払ったので amount は負）
  INSERT INTO transactions ( user_id, type, amount, balance_after)
  VALUES ( p_user_id, 'bet_loss', -p_amount, v_new_balance);

EXCEPTION
  WHEN others THEN
    -- 例外をそのまま投げ返す（クライアントでハンドリング）
    RAISE;
END;$function$
;

CREATE OR REPLACE FUNCTION public.replace_user_subjects(uid uuid, subject_names text[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  delete from user_subjects where user_id = uid;
  insert into user_subjects(user_id, subject_id)
  select uid, s.id
  from unnest(subject_names) with ordinality as t(name, ord)
  join subjects s on s.name = t.name;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;


  create policy "Enable insert for users based on user_id"
  on "public"."bets"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable read access for all users"
  on "public"."bets"
  as permissive
  for select
  to public
using (true);



  create policy "Enable read access for all users"
  on "public"."race_participants"
  as permissive
  for select
  to public
using (true);



  create policy "Disable delete"
  on "public"."races"
  as permissive
  for delete
  to public
using (false);



  create policy "Disable insert"
  on "public"."races"
  as permissive
  for insert
  to authenticated
with check (false);



  create policy "Enable read access for all users"
  on "public"."races"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for users based on user_id"
  on "public"."study_sessions"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for authenticated users only"
  on "public"."study_sessions"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."study_sessions"
  as permissive
  for select
  to public
using (true);



  create policy "Enable update for own sessions only"
  on "public"."study_sessions"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Enable read access for all users"
  on "public"."subjects"
  as permissive
  for select
  to public
using (true);



  create policy "Enable insert for users based on user_id"
  on "public"."transactions"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable read access for all users"
  on "public"."transactions"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete for users based on user_id"
  on "public"."user_subjects"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for authenticated users only"
  on "public"."user_subjects"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users"
  on "public"."user_subjects"
  as permissive
  for select
  to public
using (true);



  create policy "Enable update for own  user_subjects"
  on "public"."user_subjects"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Enable delete for users based on user_id"
  on "public"."users"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable insert for users based on user_id"
  on "public"."users"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable read access for all users"
  on "public"."users"
  as permissive
  for select
  to public
using (true);



  create policy "Enable update for own user"
  on "public"."users"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



