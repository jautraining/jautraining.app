-- =====================================================================
-- Jau Training · e-mail automático quando o aluno some (3 dias de treino seguidos sem treinar)
-- Cole tudo no SQL Editor do Supabase e clique em "Run". Pode rodar de novo sem problema.
-- Antes: crie a Edge Function "lembrete-falta" (Verify JWT desligado) e os segredos GMAIL_USER e GMAIL_APP_PASSWORD.
-- =====================================================================

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- quem já recebeu o e-mail em cada sumiço (um por sumiço; vale de novo depois que o aluno treinar)
create table if not exists public.falta_sent (
  student_id text not null references public.students(id) on delete cascade,
  last_log text not null,
  missed int,
  email text,
  sent_at timestamptz not null default now(),
  primary key (student_id, last_log)
);
alter table public.falta_sent enable row level security;
revoke all on public.falta_sent from anon;
grant select on public.falta_sent to authenticated;
drop policy if exists falta_sent_personal on public.falta_sent;
create policy falta_sent_personal on public.falta_sent for select to authenticated using (public.is_personal());

-- todo dia às 10h07 de Brasília (13h07 UTC)
select cron.unschedule(jobid) from cron.job where jobname = 'lembrete-falta';
select cron.schedule('lembrete-falta', '7 13 * * *', $job$
  select net.http_post(
    url := 'https://qddxjfghpfatbgmpisdr.supabase.co/functions/v1/lembrete-falta',
    body := '{"action": "run"}'::jsonb,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZHhqZmdocGZhdGJnbXBpc2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDgxNzUsImV4cCI6MjEwODYyNDE3NX0.KFbMd-0OFwm7e2-JdvdbAaX0alUR58TCjHVpe6LmJkQ'),
    timeout_milliseconds := 60000
  );
$job$);
