-- FundSteward core schema for Supabase (Postgres 15).
-- Members are 1:1 with auth.users.id (matches FastAPI JWT user id).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- public.members
-- ---------------------------------------------------------------------------
create table if not exists public.members (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null,
    full_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    is_active boolean not null default true,
    subscription_tier text not null default 'free',
    constraint members_email_unique unique (email)
);

create index if not exists idx_members_email on public.members (email);

-- ---------------------------------------------------------------------------
-- QuickBooks + spreadsheet domain tables
-- ---------------------------------------------------------------------------
create table if not exists public.quickbooks_connections (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members (id) on delete cascade,
    realm_id text not null,
    access_token text not null,
    refresh_token text not null,
    token_expires_at timestamptz,
    connected_at timestamptz not null default now(),
    last_synced_at timestamptz,
    is_active boolean not null default true,
    company_name text
);

create table if not exists public.qb_transactions_cache (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members (id) on delete cascade,
    transaction_type text,
    qb_transaction_id text,
    data jsonb not null,
    synced_at timestamptz not null default now()
);

create table if not exists public.spreadsheet_uploads (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members (id) on delete cascade,
    file_name text not null,
    file_type text not null,
    row_count integer not null default 0,
    uploaded_at timestamptz not null default now(),
    raw_rows jsonb not null default '[]'::jsonb
);

create table if not exists public.spreadsheet_transactions (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members (id) on delete cascade,
    upload_id uuid not null references public.spreadsheet_uploads (id) on delete cascade,
    transaction_date date,
    description text,
    amount numeric(14, 2) not null,
    balance numeric(14, 2),
    currency text not null default 'USD',
    account_name text,
    raw_row jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_quickbooks_connections_member_id
    on public.quickbooks_connections (member_id);

create index if not exists idx_qb_transactions_cache_member_id
    on public.qb_transactions_cache (member_id);

create index if not exists idx_spreadsheet_uploads_member_id
    on public.spreadsheet_uploads (member_id);

create index if not exists idx_spreadsheet_transactions_member_id
    on public.spreadsheet_transactions (member_id);

create index if not exists idx_spreadsheet_transactions_upload_id
    on public.spreadsheet_transactions (upload_id);

-- ---------------------------------------------------------------------------
-- Triggers: updated_at + profile row on signup
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_members_set_updated_at on public.members;
create trigger trg_members_set_updated_at
before update on public.members
for each row
execute function public.set_updated_at();

-- Auto-create member when a Supabase Auth user is created (OAuth or email signup).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.members (id, email, full_name)
    values (
        new.id,
        coalesce(new.email, ''),
        nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '')
    )
    on conflict (id) do update
        set email = excluded.email,
            full_name = coalesce(members.full_name, excluded.full_name);
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security (JWT auth.uid() — anon + authenticated from the app)
-- Service role (FastAPI) bypasses RLS.
-- ---------------------------------------------------------------------------

-- Remove pre-2026 policies that used auth.jwt() email checks (per-action names).
drop policy if exists quickbooks_connections_select_own on public.quickbooks_connections;
drop policy if exists quickbooks_connections_insert_own on public.quickbooks_connections;
drop policy if exists quickbooks_connections_update_own on public.quickbooks_connections;
drop policy if exists quickbooks_connections_delete_own on public.quickbooks_connections;
drop policy if exists qb_transactions_cache_select_own on public.qb_transactions_cache;
drop policy if exists qb_transactions_cache_insert_own on public.qb_transactions_cache;
drop policy if exists qb_transactions_cache_update_own on public.qb_transactions_cache;
drop policy if exists qb_transactions_cache_delete_own on public.qb_transactions_cache;
drop policy if exists spreadsheet_uploads_select_own on public.spreadsheet_uploads;
drop policy if exists spreadsheet_uploads_insert_own on public.spreadsheet_uploads;
drop policy if exists spreadsheet_uploads_update_own on public.spreadsheet_uploads;
drop policy if exists spreadsheet_uploads_delete_own on public.spreadsheet_uploads;
drop policy if exists spreadsheet_transactions_select_own on public.spreadsheet_transactions;
drop policy if exists spreadsheet_transactions_insert_own on public.spreadsheet_transactions;
drop policy if exists spreadsheet_transactions_update_own on public.spreadsheet_transactions;
drop policy if exists spreadsheet_transactions_delete_own on public.spreadsheet_transactions;

alter table public.members enable row level security;
alter table public.quickbooks_connections enable row level security;
alter table public.qb_transactions_cache enable row level security;
alter table public.spreadsheet_uploads enable row level security;
alter table public.spreadsheet_transactions enable row level security;

drop policy if exists "members_select_own" on public.members;
create policy "members_select_own"
on public.members
for select
to authenticated
using (id = auth.uid());

drop policy if exists "members_insert_own" on public.members;
create policy "members_insert_own"
on public.members
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "members_update_own" on public.members;
create policy "members_update_own"
on public.members
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "members_delete_own" on public.members;
create policy "members_delete_own"
on public.members
for delete
to authenticated
using (id = auth.uid());

drop policy if exists "quickbooks_connections_all_own" on public.quickbooks_connections;
create policy "quickbooks_connections_all_own"
on public.quickbooks_connections
for all
to authenticated
using (member_id = auth.uid())
with check (member_id = auth.uid());

drop policy if exists "qb_transactions_cache_all_own" on public.qb_transactions_cache;
create policy "qb_transactions_cache_all_own"
on public.qb_transactions_cache
for all
to authenticated
using (member_id = auth.uid())
with check (member_id = auth.uid());

drop policy if exists "spreadsheet_uploads_all_own" on public.spreadsheet_uploads;
create policy "spreadsheet_uploads_all_own"
on public.spreadsheet_uploads
for all
to authenticated
using (member_id = auth.uid())
with check (member_id = auth.uid());

drop policy if exists "spreadsheet_transactions_all_own" on public.spreadsheet_transactions;
create policy "spreadsheet_transactions_all_own"
on public.spreadsheet_transactions
for all
to authenticated
using (member_id = auth.uid())
with check (member_id = auth.uid());
