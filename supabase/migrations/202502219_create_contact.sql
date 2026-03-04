-- Drop the guest_bookings table if it exists
create table public.contacts (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     phone text,
     message text,
     created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.contacts enable row level security;

-- Allow inserts (example policy)
create policy "Allow insert for everyone"
on public.contacts
for insert
to anon
with check (true);
