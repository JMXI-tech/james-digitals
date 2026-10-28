-- Run this in Supabase Dashboard → SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.showcase_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  url text not null check (url ~* '^https?://'),
  description text not null default '',
  tags text[] not null default '{}',
  accent text not null default '#3791ff',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  order_index integer not null default 0
);
alter table public.showcase_projects enable row level security;
-- No anon/authenticated table policies are created: all access is through the server function.
