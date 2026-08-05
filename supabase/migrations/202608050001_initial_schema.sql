-- Dealo Milestone 2: consumer, merchant, venue, deal and saved-deal model.
-- Apply with `supabase db push` after linking the intended project.
create extension if not exists pgcrypto;

create type public.app_locale as enum ('en-GB', 'pt-PT');
create type public.deal_status as enum ('draft', 'published', 'paused', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale public.app_locale not null default 'en-GB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  address_line_1 text not null,
  city text not null,
  country_code char(2) not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text,
  terms text,
  discount_percent smallint check (discount_percent between 1 and 100),
  status public.deal_status not null default 'draft',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.saved_deals (
  user_id uuid not null references public.profiles(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, deal_id)
);

create index venues_merchant_id_idx on public.venues(merchant_id);
create index deals_venue_id_idx on public.deals(venue_id);
create index deals_live_idx on public.deals(status, starts_at, ends_at) where status = 'published';
create index saved_deals_user_created_idx on public.saved_deals(user_id, created_at desc);

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger merchants_updated_at before update on public.merchants for each row execute procedure public.set_updated_at();
create trigger venues_updated_at before update on public.venues for each row execute procedure public.set_updated_at();
create trigger deals_updated_at before update on public.deals for each row execute procedure public.set_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, locale)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    case new.raw_user_meta_data ->> 'locale' when 'pt-PT' then 'pt-PT'::public.app_locale else 'en-GB'::public.app_locale end
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.merchants enable row level security;
alter table public.venues enable row level security;
alter table public.deals enable row level security;
alter table public.saved_deals enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.deals, public.venues to anon, authenticated;
grant select, insert, update on public.profiles, public.merchants, public.venues, public.deals, public.saved_deals to authenticated;

create policy "Profiles are private to their owner" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users can create their own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);

create policy "Users manage their merchants" on public.merchants for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Owners manage their venues" on public.venues for all to authenticated using (exists (select 1 from public.merchants where merchants.id = venues.merchant_id and merchants.owner_id = (select auth.uid()))) with check (exists (select 1 from public.merchants where merchants.id = venues.merchant_id and merchants.owner_id = (select auth.uid())));
create policy "Published live deals are public" on public.deals for select to anon, authenticated using (status = 'published' and starts_at <= now() and ends_at > now());
create policy "Owners manage their deals" on public.deals for all to authenticated using (exists (select 1 from public.venues join public.merchants on merchants.id = venues.merchant_id where venues.id = deals.venue_id and merchants.owner_id = (select auth.uid()))) with check (exists (select 1 from public.venues join public.merchants on merchants.id = venues.merchant_id where venues.id = deals.venue_id and merchants.owner_id = (select auth.uid())));
create policy "Users manage their saved deals" on public.saved_deals for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
