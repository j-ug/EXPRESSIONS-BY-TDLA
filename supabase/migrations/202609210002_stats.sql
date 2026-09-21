begin;

-- Table for global gallery statistics
create table if not exists public.gallery_stats (
  id text primary key default 'global',
  total_visitors bigint not null default 0
);

-- Enable RLS
alter table public.gallery_stats enable row level security;

-- Policies for public reading
create policy "Allow public read access to stats"
  on public.gallery_stats for select
  to anon, authenticated
  using (true);

-- Function to safely increment visitor count
create or replace function public.increment_visitor_count()
returns void language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.gallery_stats (id, total_visitors)
  values ('global', 1)
  on conflict (id) do update
  set total_visitors = gallery_stats.total_visitors + 1;
end;
$$;

-- Grant execution to public
grant execute on function public.increment_visitor_count() to anon, authenticated;

-- Ensure initial row exists
insert into public.gallery_stats (id, total_visitors)
values ('global', 0)
on conflict (id) do nothing;

commit;
