-- =====================================================================
-- Jau Training · anamnese e fotos de avaliação dentro do app
-- Cole tudo no SQL Editor do Supabase e clique em "Run". Pode rodar de novo sem problema.
-- Quem preenche: o aluno (ou quem criou a conta e ainda não tem ficha).
-- Quem lê: SÓ a conta de personal. Nem o próprio aluno consegue ler depois de enviar.
-- =====================================================================

create table if not exists public.assessments (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  email text,
  student_id text references public.students(id) on delete set null,
  kind text not null default 'anamnese' check (kind in ('anamnese', 'fotos')),
  data jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  seen_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists assessments_user_idx on public.assessments(user_id);
create index if not exists assessments_student_idx on public.assessments(student_id);

alter table public.assessments enable row level security;
revoke all on public.assessments from anon;
grant select, insert, update, delete on public.assessments to authenticated;

-- aluno: só cria a própria avaliação (não lê, não altera, não apaga)
drop policy if exists assessments_insert_own on public.assessments;
create policy assessments_insert_own on public.assessments for insert to authenticated
  with check (user_id = auth.uid() and student_id is null and seen_at is null);
-- personal: lê, liga à ficha, marca como vista e apaga
drop policy if exists assessments_personal on public.assessments;
create policy assessments_personal on public.assessments for all to authenticated
  using (public.is_personal()) with check (public.is_personal());

-- o app do aluno só precisa saber SE e QUANDO enviou (sem ver as respostas)
create or replace function public.my_assessments()
returns table (id text, kind text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select a.id, a.kind, a.created_at from public.assessments a where a.user_id = auth.uid() order by a.created_at
$$;
revoke all on function public.my_assessments() from public, anon;
grant execute on function public.my_assessments() to authenticated;

-- ---------------------------------------------------------------------
-- Fotos: pasta privada "avaliacoes" no Storage (até 5 MB por foto, só imagens)
-- Cada pessoa só envia para a própria pasta; só o personal vê e apaga.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avaliacoes', 'avaliacoes', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avaliacoes_insert_own on storage.objects;
create policy avaliacoes_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'avaliacoes' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists avaliacoes_personal_read on storage.objects;
create policy avaliacoes_personal_read on storage.objects for select to authenticated
  using (bucket_id = 'avaliacoes' and public.is_personal());
drop policy if exists avaliacoes_personal_delete on storage.objects;
create policy avaliacoes_personal_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avaliacoes' and public.is_personal());
