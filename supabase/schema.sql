-- =====================================================================
-- Jau Training App · estrutura do banco (Supabase / Postgres)
-- Cole tudo no SQL Editor do Supabase e clique em "Run".
-- Pode rodar de novo sem problema: o script é idempotente.
-- =====================================================================

-- E-mail da conta de personal (a única que vê o painel e edita fichas).
-- Para trocar, altere aqui e rode o script de novo.
create or replace function public.personal_email() returns text
language sql immutable as $$ select 'jauoliveira0902@gmail.com'::text $$;

-- ---------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text not null default 'aluno' check (role in ('personal', 'aluno')),
  consent_terms_at timestamptz,
  consent_health_at timestamptz,
  consent_version text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists students_user_idx on public.students(user_id);
create index if not exists students_email_idx on public.students(lower(email));

-- Anotações privadas do personal: tabela separada para nunca chegarem ao aluno.
create table if not exists public.student_private (
  student_id text primary key references public.students(id) on delete cascade,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.logs (
  id text primary key,
  student_id text not null references public.students(id) on delete cascade,
  date text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists logs_student_idx on public.logs(student_id, date);

create table if not exists public.library (
  id text primary key,
  ord integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.methods (
  id text primary key,
  ord integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

-- Treinos que o personal já viu na aba Atividade.
create table if not exists public.feed_seen (
  log_id text primary key references public.logs(id) on delete cascade,
  seen_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------
create or replace function public.is_personal() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'personal');
$$;

create or replace function public.my_student_ids() returns setof text
language sql stable security definer set search_path = public as $$
  select id from public.students where user_id = auth.uid();
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

-- Cria o perfil quando alguém se cadastra e liga a conta à ficha
-- (pelo e-mail que o personal cadastrou), só depois do e-mail confirmado.
create or replace function public.handle_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'name', ''),
          case when lower(new.email) = lower(public.personal_email()) then 'personal' else 'aluno' end)
  on conflict (id) do update set email = excluded.email;
  if new.email_confirmed_at is not null then
    update public.students set user_id = new.id
     where user_id is null and email is not null and lower(email) = lower(new.email);
  end if;
  return new;
end $$;

-- Quando o personal coloca ou troca o e-mail de um aluno, liga à conta já existente.
create or replace function public.link_student_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email or tg_op = 'INSERT' then
    new.user_id := (select u.id from auth.users u
                     where new.email is not null and lower(u.email) = lower(new.email)
                       and u.email_confirmed_at is not null
                     limit 1);
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_auth_user();
drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed after update of email_confirmed_at, email on auth.users
  for each row execute function public.handle_auth_user();

drop trigger if exists students_link on public.students;
create trigger students_link before insert or update of email on public.students
  for each row execute function public.link_student_email();

drop trigger if exists students_touch on public.students;
create trigger students_touch before update on public.students for each row execute function public.touch_updated_at();
drop trigger if exists logs_touch on public.logs;
create trigger logs_touch before update on public.logs for each row execute function public.touch_updated_at();
drop trigger if exists private_touch on public.student_private;
create trigger private_touch before update on public.student_private for each row execute function public.touch_updated_at();
drop trigger if exists library_touch on public.library;
create trigger library_touch before update on public.library for each row execute function public.touch_updated_at();
drop trigger if exists methods_touch on public.methods;
create trigger methods_touch before update on public.methods for each row execute function public.touch_updated_at();

-- Perfis de quem já tinha se cadastrado antes deste script.
insert into public.profiles (id, email, name, role)
select u.id, lower(u.email), coalesce(u.raw_user_meta_data->>'name', ''),
       case when lower(u.email) = lower(public.personal_email()) then 'personal' else 'aluno' end
  from auth.users u
on conflict (id) do update set role = excluded.role, email = excluded.email;

-- ---------------------------------------------------------------------
-- Permissões (RLS)
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_private enable row level security;
alter table public.logs enable row level security;
alter table public.library enable row level security;
alter table public.methods enable row level security;
alter table public.settings enable row level security;
alter table public.feed_seen enable row level security;

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
-- No perfil, o usuário só pode mexer no nome e nos consentimentos (nunca no papel).
revoke insert, update, delete on public.profiles from authenticated;
grant update (name, consent_terms_at, consent_health_at, consent_version) on public.profiles to authenticated;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_personal());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- students: personal faz tudo; aluno só lê a própria ficha
drop policy if exists students_select on public.students;
create policy students_select on public.students for select to authenticated
  using (public.is_personal() or user_id = auth.uid());
drop policy if exists students_write on public.students;
create policy students_write on public.students for all to authenticated
  using (public.is_personal()) with check (public.is_personal());

-- student_private: só o personal
drop policy if exists private_all on public.student_private;
create policy private_all on public.student_private for all to authenticated
  using (public.is_personal()) with check (public.is_personal());

-- logs: personal faz tudo; aluno lê e registra os próprios treinos
drop policy if exists logs_all on public.logs;
create policy logs_all on public.logs for all to authenticated
  using (public.is_personal() or student_id in (select public.my_student_ids()))
  with check (public.is_personal() or student_id in (select public.my_student_ids()));

-- library, methods, settings: todos leem; só o personal edita
drop policy if exists library_select on public.library;
create policy library_select on public.library for select to authenticated using (true);
drop policy if exists library_write on public.library;
create policy library_write on public.library for all to authenticated
  using (public.is_personal()) with check (public.is_personal());

drop policy if exists methods_select on public.methods;
create policy methods_select on public.methods for select to authenticated using (true);
drop policy if exists methods_write on public.methods;
create policy methods_write on public.methods for all to authenticated
  using (public.is_personal()) with check (public.is_personal());

drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select to authenticated using (true);
drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings for all to authenticated
  using (public.is_personal()) with check (public.is_personal());

-- feed_seen: só o personal
drop policy if exists seen_all on public.feed_seen;
create policy seen_all on public.feed_seen for all to authenticated
  using (public.is_personal()) with check (public.is_personal());
