-- Enable UUID generation helpers.
create extension if not exists pgcrypto;

-- MEMBERS
create table if not exists public.members (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    full_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    is_active boolean not null default true,
    subscription_tier text not null default 'free'
);

-- QUICKBOOKS CONNECTIONS
create table if not exists public.quickbooks_connections (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    realm_id text not null,
    access_token text not null,
    refresh_token text not null,
    token_expires_at timestamptz,
    connected_at timestamptz not null default now(),
    last_synced_at timestamptz,
    is_active boolean not null default true,
    company_name text
);

-- QUICKBOOKS TRANSACTIONS CACHE
create table if not exists public.qb_transactions_cache (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    transaction_type text,
    qb_transaction_id text,
    data jsonb not null,
    synced_at timestamptz not null default now()
);

-- SPREADSHEET UPLOADS
create table if not exists public.spreadsheet_uploads (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    file_name text not null,
    file_type text not null,
    row_count integer not null default 0,
    uploaded_at timestamptz not null default now(),
    raw_rows jsonb not null default '[]'::jsonb
);

-- NORMALIZED SPREADSHEET TRANSACTIONS
create table if not exists public.spreadsheet_transactions (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    upload_id uuid not null references public.spreadsheet_uploads(id) on delete cascade,
    transaction_date date,
    description text,
    amount numeric(14,2) not null,
    balance numeric(14,2),
    currency text not null default 'USD',
    account_name text,
    raw_row jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- Indexes for foreign key lookups.
create index if not exists idx_quickbooks_connections_member_id
    on public.quickbooks_connections(member_id);

create index if not exists idx_qb_transactions_cache_member_id
    on public.qb_transactions_cache(member_id);

create index if not exists idx_spreadsheet_uploads_member_id
    on public.spreadsheet_uploads(member_id);

create index if not exists idx_spreadsheet_transactions_member_id
    on public.spreadsheet_transactions(member_id);

-- Keep members.updated_at fresh on updates.
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

-- RLS setup.
alter table public.members enable row level security;
alter table public.quickbooks_connections enable row level security;
alter table public.qb_transactions_cache enable row level security;
alter table public.spreadsheet_uploads enable row level security;
alter table public.spreadsheet_transactions enable row level security;

-- Members can only access their own row (matched by JWT email claim).
drop policy if exists members_select_own on public.members;
create policy members_select_own
on public.members
for select
using (email = auth.jwt() ->> 'email');

drop policy if exists members_insert_own on public.members;
create policy members_insert_own
on public.members
for insert
with check (email = auth.jwt() ->> 'email');

drop policy if exists members_update_own on public.members;
create policy members_update_own
on public.members
for update
using (email = auth.jwt() ->> 'email')
with check (email = auth.jwt() ->> 'email');

drop policy if exists members_delete_own on public.members;
create policy members_delete_own
on public.members
for delete
using (email = auth.jwt() ->> 'email');

-- Connection rows are member-scoped.
drop policy if exists quickbooks_connections_select_own on public.quickbooks_connections;
create policy quickbooks_connections_select_own
on public.quickbooks_connections
for select
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists quickbooks_connections_insert_own on public.quickbooks_connections;
create policy quickbooks_connections_insert_own
on public.quickbooks_connections
for insert
with check (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists quickbooks_connections_update_own on public.quickbooks_connections;
create policy quickbooks_connections_update_own
on public.quickbooks_connections
for update
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
)
with check (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists quickbooks_connections_delete_own on public.quickbooks_connections;
create policy quickbooks_connections_delete_own
on public.quickbooks_connections
for delete
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

-- Transaction cache rows are member-scoped.
drop policy if exists qb_transactions_cache_select_own on public.qb_transactions_cache;
create policy qb_transactions_cache_select_own
on public.qb_transactions_cache
for select
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists qb_transactions_cache_insert_own on public.qb_transactions_cache;
create policy qb_transactions_cache_insert_own
on public.qb_transactions_cache
for insert
with check (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists qb_transactions_cache_update_own on public.qb_transactions_cache;
create policy qb_transactions_cache_update_own
on public.qb_transactions_cache
for update
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
)
with check (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists qb_transactions_cache_delete_own on public.qb_transactions_cache;
create policy qb_transactions_cache_delete_own
on public.qb_transactions_cache
for delete
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

-- Spreadsheet uploads rows are member-scoped.
drop policy if exists spreadsheet_uploads_select_own on public.spreadsheet_uploads;
create policy spreadsheet_uploads_select_own
on public.spreadsheet_uploads
for select
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists spreadsheet_uploads_insert_own on public.spreadsheet_uploads;
create policy spreadsheet_uploads_insert_own
on public.spreadsheet_uploads
for insert
with check (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists spreadsheet_uploads_update_own on public.spreadsheet_uploads;
create policy spreadsheet_uploads_update_own
on public.spreadsheet_uploads
for update
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
)
with check (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists spreadsheet_uploads_delete_own on public.spreadsheet_uploads;
create policy spreadsheet_uploads_delete_own
on public.spreadsheet_uploads
for delete
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

-- Spreadsheet transaction rows are member-scoped.
drop policy if exists spreadsheet_transactions_select_own on public.spreadsheet_transactions;
create policy spreadsheet_transactions_select_own
on public.spreadsheet_transactions
for select
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists spreadsheet_transactions_insert_own on public.spreadsheet_transactions;
create policy spreadsheet_transactions_insert_own
on public.spreadsheet_transactions
for insert
with check (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists spreadsheet_transactions_update_own on public.spreadsheet_transactions;
create policy spreadsheet_transactions_update_own
on public.spreadsheet_transactions
for update
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
)
with check (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);

drop policy if exists spreadsheet_transactions_delete_own on public.spreadsheet_transactions;
create policy spreadsheet_transactions_delete_own
on public.spreadsheet_transactions
for delete
using (
    member_id in (
        select m.id from public.members m where m.email = auth.jwt() ->> 'email'
    )
);
