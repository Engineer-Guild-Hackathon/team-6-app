drop extension if exists "pg_net";

create extension if not exists "moddatetime" with schema "public";

create type "public"."bet_type" as enum ('win', 'place', 'support');

create type "public"."race_status" as enum ('upcoming', 'drawing', 'active', 'finished');

create type "public"."transaction_type" as enum ('study_reward', 'race_prize', 'bet_win', 'bet_loss', 'login_bonus', 'skin_purchase');


  create table "public"."bets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "race_id" uuid not null,
    "participant_id" uuid not null,
    "type" bet_type not null,
    "amount" integer not null,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."race_participants" (
    "id" uuid not null default gen_random_uuid(),
    "race_id" uuid not null,
    "user_id" uuid not null,
    "final_rank" integer,
    "prize" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."races" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "status" race_status not null default 'upcoming'::race_status,
    "race_start_date" timestamp with time zone not null,
    "race_end_date" timestamp with time zone not null,
    "total_pot" integer default 0,
    "first_prize" integer default 0,
    "second_prize" integer default 0,
    "third_prize" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "drawing_start_date" timestamp with time zone not null,
    "drawing_end_date" timestamp with time zone not null,
    "min_age" integer,
    "max_age" integer
      );



  create table "public"."study_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "subject_id" uuid not null,
    "comment" text,
    "duration" integer not null,
    "bet_coins_earned" integer not null,
    "date" timestamp with time zone not null,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."subjects" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."transactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" transaction_type not null,
    "amount" integer not null,
    "balance_after" integer not null,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."user_subjects" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "subject_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."users" (
    "id" uuid not null,
    "email" text not null,
    "username" text not null,
    "age" integer,
    "occupation" text,
    "bet_coins" integer not null default 1500,
    "total_study_time" integer not null default 0,
    "current_week_study_time" integer not null default 0,
    "current_week_study_goal" integer,
    "avatar" text not null default '🎯'::text,
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


CREATE UNIQUE INDEX bets_pkey ON public.bets USING btree (id);

CREATE UNIQUE INDEX race_participants_pkey ON public.race_participants USING btree (id);

CREATE UNIQUE INDEX race_participants_race_id_user_id_key ON public.race_participants USING btree (race_id, user_id);

CREATE UNIQUE INDEX races_pkey ON public.races USING btree (id);

CREATE UNIQUE INDEX study_sessions_pkey ON public.study_sessions USING btree (id);

CREATE UNIQUE INDEX subjects_name_key ON public.subjects USING btree (name);

CREATE UNIQUE INDEX subjects_pkey ON public.subjects USING btree (id);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX user_subjects_pkey ON public.user_subjects USING btree (id);

CREATE UNIQUE INDEX user_subjects_user_id_subject_id_key ON public.user_subjects USING btree (user_id, subject_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."bets" add constraint "bets_pkey" PRIMARY KEY using index "bets_pkey";

alter table "public"."race_participants" add constraint "race_participants_pkey" PRIMARY KEY using index "race_participants_pkey";

alter table "public"."races" add constraint "races_pkey" PRIMARY KEY using index "races_pkey";

alter table "public"."study_sessions" add constraint "study_sessions_pkey" PRIMARY KEY using index "study_sessions_pkey";

alter table "public"."subjects" add constraint "subjects_pkey" PRIMARY KEY using index "subjects_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."user_subjects" add constraint "user_subjects_pkey" PRIMARY KEY using index "user_subjects_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."bets" add constraint "bets_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES users(id) not valid;

alter table "public"."bets" validate constraint "bets_participant_id_fkey";

alter table "public"."bets" add constraint "bets_race_id_fkey" FOREIGN KEY (race_id) REFERENCES races(id) not valid;

alter table "public"."bets" validate constraint "bets_race_id_fkey";

alter table "public"."bets" add constraint "bets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."bets" validate constraint "bets_user_id_fkey";

alter table "public"."race_participants" add constraint "race_participants_race_id_fkey" FOREIGN KEY (race_id) REFERENCES races(id) not valid;

alter table "public"."race_participants" validate constraint "race_participants_race_id_fkey";

alter table "public"."race_participants" add constraint "race_participants_race_id_user_id_key" UNIQUE using index "race_participants_race_id_user_id_key";

alter table "public"."race_participants" add constraint "race_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."race_participants" validate constraint "race_participants_user_id_fkey";

alter table "public"."study_sessions" add constraint "study_sessions_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES subjects(id) not valid;

alter table "public"."study_sessions" validate constraint "study_sessions_subject_id_fkey";

alter table "public"."study_sessions" add constraint "study_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."study_sessions" validate constraint "study_sessions_user_id_fkey";

alter table "public"."subjects" add constraint "subjects_name_key" UNIQUE using index "subjects_name_key";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."user_subjects" add constraint "user_subjects_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES subjects(id) not valid;

alter table "public"."user_subjects" validate constraint "user_subjects_subject_id_fkey";

alter table "public"."user_subjects" add constraint "user_subjects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."user_subjects" validate constraint "user_subjects_user_id_fkey";

alter table "public"."user_subjects" add constraint "user_subjects_user_id_subject_id_key" UNIQUE using index "user_subjects_user_id_subject_id_key";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";

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


  create policy "Enable read access for users based on user_id"
  on "public"."users"
  as permissive
  for select
  to public
using ((auth.uid() = id));


CREATE TRIGGER trg_update_updated_at_race_participants BEFORE UPDATE ON public.race_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_updated_at_races BEFORE UPDATE ON public.races FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.user_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


