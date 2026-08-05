-- Only deals visible to consumers can be saved. This closes the gap in the
-- original broad saved_deals policy, which accepted any existing deal UUID.
drop policy "Users manage their saved deals" on public.saved_deals;

create policy "Users view their saved deals"
on public.saved_deals for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users save live deals"
on public.saved_deals for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.deals
    where deals.id = saved_deals.deal_id
      and deals.status = 'published'
      and deals.starts_at <= now()
      and deals.ends_at > now()
  )
);

create policy "Users remove their saved deals"
on public.saved_deals for delete to authenticated
using ((select auth.uid()) = user_id);
