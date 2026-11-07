-- ==============================================================================
-- JLPT N3 PRACTICE HUB - SUPABASE / POSTGRESQL SCHEMA (PHASE 2)
-- ==============================================================================
-- Thiết kế theo tiêu chuẩn PRD: RLS deny-by-default, bảo mật thông tin học viên,
-- hỗ trợ đồng bộ đa thiết bị, lưu trữ khảo sát và báo lỗi câu hỏi cho Admin.
-- ==============================================================================

-- 1. BẢNG HỒ SƠ NGƯỜI DÙNG (PROFILES)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  role text default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Policy: Người dùng chỉ được xem và sửa hồ sơ của chính mình
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. BẢNG BỘ ĐỀ THI (EXAMS - Lưu trữ hoặc đồng bộ từ JSON)
create table if not exists public.exams (
  id text primary key, -- vd: "n3-2026-set-001"
  title text not null,
  description text,
  level text default 'N3' not null,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  question_count integer default 0 not null,
  time_limit_minutes integer default 30 not null,
  content jsonb not null, -- Chứa toàn bộ passages và questions theo schema 1.0.0
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.exams enable row level security;

-- Policy: Mọi người (cả khách ẩn danh) có thể xem đề đã published
create policy "Anyone can read published exams"
  on public.exams for select
  using (status = 'published');

-- Policy: Admin có toàn quyền tạo/sửa đề
create policy "Admins can manage exams"
  on public.exams for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3. BẢNG LƯỢT LÀM BÀI (ATTEMPTS)
create table if not exists public.attempts (
  id text primary key, -- UUID hoặc att-xxx
  user_id uuid references public.profiles(id) on delete cascade not null,
  exam_id text references public.exams(id) on delete cascade not null,
  mode text check (mode in ('practice', 'exam')) not null,
  started_at timestamptz default timezone('utc'::text, now()) not null,
  submitted_at timestamptz,
  elapsed_seconds integer default 0 not null,
  score_percent numeric(5, 1) default 0.0,
  answers jsonb default '{}'::jsonb not null,
  checked_question_ids jsonb default '[]'::jsonb not null,
  flagged_question_ids jsonb default '[]'::jsonb not null,
  status text default 'in_progress' check (status in ('in_progress', 'completed')) not null
);

create index if unfair_attempts_user_id on public.attempts(user_id);
create index if unfair_attempts_exam_id on public.attempts(exam_id);

alter table public.attempts enable row level security;

-- Policy: Người dùng chỉ xem và cập nhật attempt của chính mình
create policy "Learners can view own attempts"
  on public.attempts for select
  using (auth.uid() = user_id);

create policy "Learners can insert own attempts"
  on public.attempts for insert
  with check (auth.uid() = user_id);

create policy "Learners can update own attempts"
  on public.attempts for update
  using (auth.uid() = user_id);

-- 4. BẢNG KHẢO SÁT CẢM NHẬN (SURVEYS)
create table if not exists public.surveys (
  id uuid default gen_random_uuid() primary key,
  attempt_id text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exam_id text references public.exams(id) on delete cascade not null,
  difficulty_rating integer check (difficulty_rating between 1 and 5) not null,
  usefulness_rating integer check (usefulness_rating between 1 and 5) not null,
  feedback_text text,
  submitted_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.surveys enable row level security;

create policy "Learners can insert surveys"
  on public.surveys for insert
  with check (auth.uid() = user_id);

create policy "Learners can view own surveys"
  on public.surveys for select
  using (auth.uid() = user_id);

-- Admin xem tổng hợp tất cả survey
create policy "Admins can view all surveys"
  on public.surveys for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 5. BẢNG BÁO LỖI CÂU HỎI (QUESTION REPORTS)
create table if not exists public.question_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  question_id text not null,
  exam_id text,
  issue_type text check (issue_type in ('wrong_answer', 'unclear_explanation', 'typo', 'other')) not null,
  comment text,
  status text default 'pending' check (status in ('pending', 'investigating', 'resolved')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.question_reports enable row level security;

create policy "Learners can report questions"
  on public.question_reports for insert
  with check (true);

create policy "Admins can view and manage question reports"
  on public.question_reports for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 6. TRIGGER TỰ ĐỘNG TẠO PROFILE KHI ĐĂNG KÝ
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

