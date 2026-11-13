create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  location text not null default '',
  website text not null default '',
  timezone text not null default '',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists location text not null default '';
alter table public.profiles add column if not exists website text not null default '';
alter table public.profiles add column if not exists timezone text not null default '';
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
