-- HỌC TIẾNG TÀY – SUPABASE POSTGRESQL SCHEMA
-- Chạy trong Supabase SQL Editor sau khi tạo project.
-- Không lưu service_role key ở frontend.

create extension if not exists pgcrypto;

create type public.content_status as enum ('draft','review','approved','published','rejected');
create type public.user_role as enum ('student','editor','admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.dialects (
  id uuid primary key default gen_random_uuid(),
  language_code text not null default 'ty',
  name text not null,
  region text not null,
  description text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.dialects(name,region,description,is_default)
values ('Tiếng Tày – khu vực Thái Nguyên','Thái Nguyên, Việt Nam',
        'Phạm vi khởi đầu; cần xác định xã/huyện và cộng tác viên bản ngữ trước khi chuẩn hóa.',true);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  dialect_id uuid not null references public.dialects(id),
  title text not null,
  level smallint not null check(level between 1 and 3),
  description text,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  objectives text,
  body jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  estimated_minutes int,
  status public.content_status not null default 'draft',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  dialect_id uuid not null references public.dialects(id),
  tay_text text not null,
  vietnamese text not null,
  pronunciation_note text,
  part_of_speech text,
  example_tay text,
  example_vi text,
  region_note text,
  source_note text,
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vocabulary_search_vi on public.vocabulary using gin (to_tsvector('simple', vietnamese));
create index vocabulary_search_tay on public.vocabulary using gin (to_tsvector('simple', tay_text));

create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  dialect_id uuid not null references public.dialects(id),
  vocabulary_id uuid references public.vocabulary(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  speaker_label text not null,
  speaker_region text not null,
  storage_path text not null,
  mime_type text,
  duration_seconds numeric,
  consent_reference text not null,
  consent_confirmed boolean not null default false,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question text not null,
  question_type text not null check(question_type in ('multiple_choice','listening','matching','text')),
  options jsonb not null default '[]'::jsonb,
  answer_key jsonb,
  explanation text,
  status public.content_status not null default 'draft'
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique(user_id,course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  score numeric check(score between 0 and 100),
  last_seen_at timestamptz not null default now(),
  unique(user_id,lesson_id)
);

-- Role helper. Chỉ admin/editor mới được sửa nội dung.
create or replace function public.has_editor_role()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('editor','admin')); $$;

create or replace function public.has_admin_role()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'); $$;

-- RLS
alter table public.profiles enable row level security;
alter table public.dialects enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.vocabulary enable row level security;
alter table public.recordings enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profile read self" on public.profiles for select using(id=auth.uid() or public.has_admin_role());
create policy "profile update self" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());

create policy "dialects public read" on public.dialects for select using(true);
create policy "dialects editors write" on public.dialects for all using(public.has_editor_role()) with check(public.has_editor_role());

create policy "published courses read" on public.courses for select using(status='published' or public.has_editor_role());
create policy "editors manage courses" on public.courses for all using(public.has_editor_role()) with check(public.has_editor_role());

create policy "published lessons read" on public.lessons for select using(status='published' or public.has_editor_role());
create policy "editors manage lessons" on public.lessons for all using(public.has_editor_role()) with check(public.has_editor_role());

create policy "approved vocabulary read" on public.vocabulary for select using(status in ('approved','published') or public.has_editor_role());
create policy "editors manage vocabulary" on public.vocabulary for all using(public.has_editor_role()) with check(public.has_editor_role());

create policy "published recordings read" on public.recordings for select using(status='published' or public.has_editor_role());
create policy "editors manage recordings" on public.recordings for all using(public.has_editor_role()) with check(public.has_editor_role());

create policy "published quizzes read" on public.quiz_questions for select using(status='published' or public.has_editor_role());
create policy "editors manage quizzes" on public.quiz_questions for all using(public.has_editor_role()) with check(public.has_editor_role());

create policy "users read own enrollments" on public.enrollments for select using(user_id=auth.uid() or public.has_admin_role());
create policy "users manage own enrollments" on public.enrollments for insert with check(user_id=auth.uid());
create policy "users delete own enrollments" on public.enrollments for delete using(user_id=auth.uid());

create policy "users read own progress" on public.lesson_progress for select using(user_id=auth.uid() or public.has_admin_role());
create policy "users write own progress" on public.lesson_progress for all using(user_id=auth.uid()) with check(user_id=auth.uid());

-- Storage bucket for lesson and speaker audio.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('tay-audio','tay-audio',true,20971520,array['audio/mpeg','audio/wav','audio/ogg','audio/mp4'])
on conflict (id) do nothing;

create policy "public read published audio objects" on storage.objects
for select using(bucket_id='tay-audio');
create policy "editors upload audio" on storage.objects
for insert with check(bucket_id='tay-audio' and public.has_editor_role());
create policy "editors update audio" on storage.objects
for update using(bucket_id='tay-audio' and public.has_editor_role());
create policy "editors delete audio" on storage.objects
for delete using(bucket_id='tay-audio' and public.has_editor_role());

-- Lưu ý: sau khi tạo tài khoản admin đầu tiên, nâng role thủ công trong SQL Editor:
-- update public.profiles set role='admin' where id='UUID_CUA_TAI_KHOAN';
-- Cần tạo trigger tạo profile khi auth.users có người dùng mới ở bước triển khai.

-- Cộng tác viên và nội dung cộng đồng gửi về (bổ sung cho trang collaborator.html).
create table public.contributor_applications (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  contact text not null,
  commune text,
  fluency text,
  skills text[] not null default '{}',
  note text,
  consent_at timestamptz not null default now(),
  status public.content_status not null default 'review',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.community_submissions (
  id uuid primary key default gen_random_uuid(),
  tay_text text not null,
  vietnamese text,
  commune text not null,
  usage_context text,
  contributor_label text,
  audio_storage_path text,
  audio_file_name text,
  permission_confirmed boolean not null default false,
  status public.content_status not null default 'review',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contributor_applications enable row level security;
alter table public.community_submissions enable row level security;

-- Người chưa đăng nhập chỉ được gửi hồ sơ/nội dung; không được đọc dữ liệu cá nhân của người khác.
create policy "public submit contributor application" on public.contributor_applications
for insert to anon, authenticated with check (length(trim(display_name)) > 0 and length(trim(contact)) > 0);
create policy "editors read contributor applications" on public.contributor_applications
for select to authenticated using (public.has_editor_role());
create policy "editors update contributor applications" on public.contributor_applications
for update to authenticated using (public.has_editor_role()) with check (public.has_editor_role());

create policy "public submit community contribution" on public.community_submissions
for insert to anon, authenticated with check (length(trim(tay_text)) > 0 and length(trim(commune)) > 0 and permission_confirmed = true);
create policy "editors read community contributions" on public.community_submissions
for select to authenticated using (public.has_editor_role());
create policy "editors update community contributions" on public.community_submissions
for update to authenticated using (public.has_editor_role()) with check (public.has_editor_role());
