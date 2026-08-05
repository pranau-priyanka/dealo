-- Dealo Milestone 5: Portugal-first community deal submissions, voting and comments.
-- Community deals enter a pending moderation state; only verified, published deals
-- remain visible in the public catalogue.

create type public.deal_source as enum ('merchant', 'community');
create type public.community_moderation_status as enum ('pending', 'approved', 'rejected');
create type public.deal_category as enum (
  'technology',
  'home',
  'food',
  'travel',
  'fashion',
  'beauty',
  'sports',
  'other'
);

alter table public.deals
  alter column venue_id drop not null,
  add column source public.deal_source not null default 'merchant',
  add column moderation_status public.community_moderation_status,
  add column submitted_by uuid references public.profiles(id) on delete set null,
  add column retailer_name text check (retailer_name is null or char_length(retailer_name) between 2 and 120),
  add column deal_url text check (deal_url is null or deal_url ~ '^https://'),
  add column category public.deal_category,
  add column current_price numeric(10, 2) check (current_price is null or current_price > 0),
  add column previous_price numeric(10, 2) check (previous_price is null or previous_price > 0),
  add column currency char(3) not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  add column vote_score integer not null default 0,
  add column comment_count integer not null default 0,
  add constraint community_deals_have_submission_details check (
    source = 'merchant'
    or (
      venue_id is null
      and submitted_by is not null
      and retailer_name is not null
      and deal_url is not null
      and moderation_status is not null
    )
  ),
  add constraint deal_prices_are_ordered check (
    previous_price is null
    or current_price is null
    or previous_price >= current_price
  );

create index deals_community_queue_idx
  on public.deals(status, created_at desc)
  where source = 'community';
create index deals_category_live_idx
  on public.deals(category, starts_at, ends_at)
  where status = 'published';
create index deals_retailer_name_idx on public.deals(retailer_name);

create table public.deal_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  deal_id uuid not null references public.deals(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, deal_id)
);

create index deal_votes_deal_id_idx on public.deal_votes(deal_id);

create table public.deal_comments (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deal_comments_deal_created_idx
  on public.deal_comments(deal_id, created_at asc)
  where not is_hidden;

create trigger deal_votes_updated_at
before update on public.deal_votes
for each row execute procedure public.set_updated_at();

create trigger deal_comments_updated_at
before update on public.deal_comments
for each row execute procedure public.set_updated_at();

create function public.sync_deal_vote_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.deals
    set vote_score = vote_score + new.value
    where id = new.deal_id;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    update public.deals
    set vote_score = vote_score + new.value - old.value
    where id = new.deal_id;
    return new;
  end if;

  update public.deals
  set vote_score = vote_score - old.value
  where id = old.deal_id;
  return old;
end;
$$;

create trigger deal_votes_sync_score
after insert or update or delete on public.deal_votes
for each row execute procedure public.sync_deal_vote_score();

create function public.sync_deal_comment_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if not new.is_hidden then
      update public.deals
      set comment_count = comment_count + 1
      where id = new.deal_id;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.is_hidden <> new.is_hidden then
      update public.deals
      set comment_count = greatest(0, comment_count + case when new.is_hidden then -1 else 1 end)
      where id = new.deal_id;
    end if;
    return new;
  end if;

  if not old.is_hidden then
    update public.deals
    set comment_count = greatest(0, comment_count - 1)
    where id = old.deal_id;
  end if;
  return old;
end;
$$;

create trigger deal_comments_sync_count
after insert or update or delete on public.deal_comments
for each row execute procedure public.sync_deal_comment_count();

alter table public.deal_votes enable row level security;
alter table public.deal_comments enable row level security;

grant select, insert, update, delete on public.deal_votes to authenticated;
grant select on public.deal_comments to anon, authenticated;
grant insert, delete on public.deal_comments to authenticated;

create policy "Members view their community submissions"
on public.deals for select to authenticated
using (
  source = 'community'
  and submitted_by = (select auth.uid())
);

create policy "Members submit community deals"
on public.deals for insert to authenticated
with check (
  source = 'community'
  and submitted_by = (select auth.uid())
  and status = 'draft'
  and moderation_status = 'pending'
  and venue_id is null
);

create policy "Members view their votes"
on public.deal_votes for select to authenticated
using (user_id = (select auth.uid()));

create policy "Members vote on live deals"
on public.deal_votes for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.deals
    where deals.id = deal_votes.deal_id
      and deals.status = 'published'
      and deals.starts_at <= now()
      and deals.ends_at > now()
  )
);

create policy "Members change their votes"
on public.deal_votes for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.deals
    where deals.id = deal_votes.deal_id
      and deals.status = 'published'
      and deals.starts_at <= now()
      and deals.ends_at > now()
  )
);

create policy "Members remove their votes"
on public.deal_votes for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Public view visible comments on live deals"
on public.deal_comments for select to anon, authenticated
using (
  not is_hidden
  and exists (
    select 1
    from public.deals
    where deals.id = deal_comments.deal_id
      and deals.status = 'published'
      and deals.starts_at <= now()
      and deals.ends_at > now()
  )
);

create policy "Members comment on live deals"
on public.deal_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and not is_hidden
  and exists (
    select 1
    from public.deals
    where deals.id = deal_comments.deal_id
      and deals.status = 'published'
      and deals.starts_at <= now()
      and deals.ends_at > now()
  )
);

create policy "Members remove their comments"
on public.deal_comments for delete to authenticated
using (author_id = (select auth.uid()));
