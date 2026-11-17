-- =====================================================================
-- Jau Training · notificações do PERSONAL (treino concluído + número no ícone)
-- Rode DEPOIS de publicar a Edge Function "notificar-treino".
-- Cole tudo no SQL Editor do Supabase e clique em "Run". Pode rodar de novo sem problema.
-- Os alunos não recebem nada: só aparelhos da conta de personal ficam inscritos.
-- =====================================================================

create extension if not exists pg_net;

-- Aparelhos do personal que recebem as notificações (só a conta de personal grava e lê).
create table if not exists public.push_subs (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  user_id uuid default auth.uid(),
  ua text,
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists push_subs_personal on public.push_subs;
create policy push_subs_personal on public.push_subs for all to authenticated
  using (public.is_personal()) with check (public.is_personal());
grant select, insert, update, delete on public.push_subs to authenticated;

-- Chaves do Web Push (criadas sozinhas pela função) e treinos já avisados: só o servidor mexe.
create table if not exists public.push_config (id int primary key default 1, pub text not null, priv text not null);
create table if not exists public.push_sent (log_id text primary key, sent_at timestamptz not null default now());
alter table public.push_config enable row level security;
alter table public.push_sent enable row level security;
revoke all on public.push_config, public.push_sent from anon, authenticated;

-- Quando um treino NOVO chega (do aluno), chama a função. Treinos lançados pelo próprio personal não avisam.
create or replace function public.notify_new_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_personal() then return new; end if;
  perform net.http_post(
    url := 'https://qddxjfghpfatbgmpisdr.supabase.co/functions/v1/notificar-treino',
    body := jsonb_build_object('id', new.id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZHhqZmdocGZhdGJnbXBpc2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDgxNzUsImV4cCI6MjEwODYyNDE3NX0.KFbMd-0OFwm7e2-JdvdbAaX0alUR58TCjHVpe6LmJkQ')
  );
  return new;
exception when others then
  return new; -- se o aviso falhar, o treino é salvo do mesmo jeito
end $$;

drop trigger if exists logs_notify on public.logs;
create trigger logs_notify after insert on public.logs
  for each row execute function public.notify_new_log();
