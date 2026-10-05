-- Run once in the Supabase SQL Editor for this project.
create table if not exists public.page_visits (
  id bigint generated always as identity primary key,
  page_path text not null,
  visited_at timestamptz not null default now()
);

alter table public.page_visits enable row level security;
revoke all on public.page_visits from public, anon, authenticated;
grant select, insert on public.page_visits to service_role;
