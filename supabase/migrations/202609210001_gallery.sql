begin;

create table public.gallery_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.gallery_admins enable row level security;
revoke all on public.gallery_admins from anon, authenticated;

create function public.is_gallery_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists(select 1 from public.gallery_admins where user_id = auth.uid());
$$;
revoke all on function public.is_gallery_admin() from public;
grant execute on function public.is_gallery_admin() to anon, authenticated;

create table public.artworks (
  id text primary key,
  details jsonb not null check (jsonb_typeof(details) = 'object' and length(details->>'title') > 0),
  created_at timestamptz not null default now()
);
alter table public.artworks enable row level security;
revoke all on public.artworks from anon, authenticated;
grant select on public.artworks to anon, authenticated;
grant insert, update, delete on public.artworks to authenticated;

create policy "Public gallery" on public.artworks for select to anon, authenticated using (true);
create policy "Admin insert" on public.artworks for insert to authenticated with check (public.is_gallery_admin());
create policy "Admin update" on public.artworks for update to authenticated using (public.is_gallery_admin()) with check (public.is_gallery_admin());
create policy "Admin delete" on public.artworks for delete to authenticated using (public.is_gallery_admin());

create function public.delete_all_gallery_artworks()
returns void language plpgsql security invoker set search_path = ''
as $$
begin
  if not public.is_gallery_admin() then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;
  delete from public.artworks;
end;
$$;
revoke all on function public.delete_all_gallery_artworks() from public;
grant execute on function public.delete_all_gallery_artworks() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('canvas-images', 'canvas-images', true, 5242880, array['image/jpeg','image/png','image/webp']);
create policy "Admin image upload" on storage.objects for insert to authenticated
with check (bucket_id = 'canvas-images' and public.is_gallery_admin());
create policy "Admin image delete" on storage.objects for delete to authenticated
using (bucket_id = 'canvas-images' and public.is_gallery_admin());
create policy "Admin image list" on storage.objects for select to authenticated
using (bucket_id = 'canvas-images' and public.is_gallery_admin());

commit;

