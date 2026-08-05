-- Dealo Milestone 4: retain a merchant-visible audit trail for deal lifecycle changes.
create table public.deal_status_events (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  changed_by uuid not null references public.profiles(id) on delete restrict,
  previous_status public.deal_status not null,
  status public.deal_status not null,
  created_at timestamptz not null default now(),
  check (previous_status <> status)
);

create index deal_status_events_deal_created_idx
  on public.deal_status_events (deal_id, created_at desc);

alter table public.deal_status_events enable row level security;
grant select on public.deal_status_events to authenticated;

create policy "Merchant owners read their deal status history"
  on public.deal_status_events for select to authenticated
  using (
    exists (
      select 1
      from public.deals
      join public.venues on venues.id = deals.venue_id
      join public.merchants on merchants.id = venues.merchant_id
      where deals.id = deal_status_events.deal_id
        and merchants.owner_id = (select auth.uid())
    )
  );

create function public.record_deal_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.deal_status_events (
    deal_id,
    changed_by,
    previous_status,
    status
  )
  values (new.id, auth.uid(), old.status, new.status);
  return new;
end;
$$;

create trigger deals_record_status_change
  after update of status on public.deals
  for each row
  when (old.status is distinct from new.status)
  execute procedure public.record_deal_status_change();
