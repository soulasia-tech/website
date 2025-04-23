-- Create users table that extends Supabase auth.users
create table public.users (
  id uuid references auth.users(id) primary key,
  email text not null,
  first_name text,
  last_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;

-- Create bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  room_id text not null,
  check_in date not null,
  check_out date not null,
  number_of_guests integer not null,
  total_price decimal(10,2) not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.bookings enable row level security;

-- Create policies for users table
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

-- Create policies for bookings table
create policy "Users can view their own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users can create their own bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own bookings" on public.bookings
  for update using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger to automatically create user record when a new auth user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 