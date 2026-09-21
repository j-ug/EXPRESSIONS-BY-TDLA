import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const db = new PGlite();
await db.exec(`
  create role anon;
  create role authenticated;
  create schema auth;
  create schema storage;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects(id uuid default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant select, insert, update, delete on storage.objects to authenticated;
`);
await db.exec(await readFile(new URL('../supabase/migrations/202609210001_gallery.sql', import.meta.url), 'utf8'));
const admin = '11111111-1111-4111-8111-111111111111';
const visitor = '22222222-2222-4222-8222-222222222222';
await db.exec(`
  insert into auth.users values ('${admin}'), ('${visitor}');
  insert into public.gallery_admins values ('${admin}');
  insert into public.artworks values ('existing', '{"title":"Existing","price":"100"}', now());
`);
async function asUser(role, uid, sql) {
  await db.exec('begin');
  try {
    await db.exec(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
    const result = await db.query(sql);
    await db.exec('commit');
    return result;
  } catch (error) { await db.exec('rollback'); throw error; }
}
assert.equal((await asUser('anon', '', 'select * from public.artworks')).rows.length, 1);
await assert.rejects(asUser('anon', '', "insert into public.artworks(id,details) values ('bad','{\"title\":\"Bad\"}')"));
await assert.rejects(asUser('authenticated', visitor, "insert into public.artworks(id,details) values ('bad','{\"title\":\"Bad\"}')"));
await assert.rejects(asUser('authenticated', visitor, `insert into public.gallery_admins values ('${visitor}')`));
assert.equal((await asUser('authenticated', visitor, "update public.artworks set details='{\"title\":\"Hacked\"}' returning id")).rows.length, 0);
assert.equal((await asUser('authenticated', visitor, "delete from public.artworks returning id")).rows.length, 0);
await assert.rejects(asUser('authenticated', visitor, 'select public.delete_all_gallery_artworks()'));
await assert.rejects(asUser('authenticated', visitor, "insert into storage.objects(bucket_id,name) values ('canvas-images','bad')"));
await asUser('authenticated', admin, "insert into public.artworks(id,details) values ('new','{\"title\":\"New\"}')");
await asUser('authenticated', admin, "update public.artworks set details='{\"title\":\"Cleared\"}' where id='existing'");
assert.equal((await asUser('anon', '', "select details->>'price' as price from public.artworks where id='existing'")).rows[0].price, null);
await asUser('authenticated', admin, "insert into storage.objects(bucket_id,name) values ('canvas-images','test')");
await asUser('authenticated', admin, "delete from public.artworks where id='new'");
await db.exec(`delete from public.gallery_admins where user_id='${admin}'`);
assert.equal((await asUser('authenticated', admin, 'select public.is_gallery_admin() as admin')).rows[0].admin, false);
await assert.rejects(asUser('authenticated', admin, 'select public.delete_all_gallery_artworks()'));
await db.exec(`insert into public.gallery_admins values ('${admin}')`);
await asUser('authenticated', admin, 'select public.delete_all_gallery_artworks()');
assert.equal((await asUser('anon', '', 'select * from public.artworks')).rows.length, 0);
await db.close();
console.log('PASS: public reads; denied anonymous/user writes; protected admin membership; admin CRUD; optional-field removal; image upload permissions; immediate revocation; empty gallery.');

