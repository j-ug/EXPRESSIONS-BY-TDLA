# Supabase setup (replaces Firebase)

The app uses Supabase Auth, Postgres and Storage. Firebase is no longer used by the application.
The old Firebase cloud project and its data are not deleted by this code change.

## 1. Create or select a Free Supabase project

Use a Free organization/project. Free has usage quotas and inactivity pausing; it is not unlimited hosting.
See https://supabase.com/pricing. Do not upgrade or enable paid add-ons for this setup.

Run `supabase/migrations/202609210001_gallery.sql` once in that project's SQL Editor.
It creates artworks, a protected gallery_admins table, an admin-check function and the canvas-images bucket.
Run it on a new project/schema; it intentionally fails rather than overwriting existing tables.
Only SQL Editor/service administrators can change gallery_admins. Visitors cannot promote themselves
using signup metadata, localStorage, or API writes. RLS enforces artwork and storage writes.

## 2. Configure the application

Copy the project URL and publishable key from Supabase Connect/API settings:
```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

Set these in AI Studio's environment and in Netlify's build environment. Rebuild after changes.
Never use a service_role or secret key in VITE_* variables.
Remove the obsolete VITE_FIREBASE_* deployment variables after successful cutover.

## 3. Create the curator and grant admin

In Supabase Authentication, create a confirmed email/password user using the secure dashboard.
Choose a new password; Firebase users/passwords do not transfer automatically.
Copy that user's UUID and execute this in the SQL Editor:
```sql
insert into public.gallery_admins (user_id)
values ('REPLACE_WITH_CONFIRMED_CURATOR_UUID')
on conflict do nothing;
```
Sign in through the app's normal login. There is no admin autofill or bundled password.
To revoke access, delete that UUID from gallery_admins using the SQL Editor.
Database authorization changes immediately; the UI refreshes on sign-in/window focus.

## 4. Email signup and redirects

Set Supabase Auth Site URL to the production Netlify URL and allow only the actual
development/preview callback URLs you use. Public email signup needs custom SMTP:
Supabase's default mail sender is restricted and not suitable for public production delivery.
See https://supabase.com/docs/guides/auth/auth-smtp.
SMTP provider quotas/costs are separate. For a curator-only initial launch, create the
confirmed curator through the dashboard and disable public signup in Supabase until SMTP is ready.
Do not disable email verification just to bypass delivery configuration.

## 5. Preserve and transfer artworks before switching production

Do not delete the Firebase project. Keep an export of its artworks and images.
No automatic import occurs on page load. Empty Supabase galleries remain empty.
The old browser cache is retained only as an offline fallback and is not a migration.

Use the admin dashboard's explicit JSON import to import an array of BotanicalArtwork objects
exported from the previous gallery. IDs and details are preserved. Duplicate IDs fail rather than
overwrite existing data. Data-URL images are uploaded to Supabase Storage (JPG/PNG/WebP, max 5 MB).
Existing image URLs are retained; copy Firebase-hosted images before retiring that project.
Import is sequential and can partially succeed; the screen reloads remote data after any error.
Check counts, titles, details and images in Supabase before deploying the new branch.
No user accounts or local-only reviews are automatically transferred.

## 6. Netlify and verification

Keep netlify.toml: npm run build, dist, Node 22, SPA fallback.
Connect GitHub and deploy the merged branch after configuration/import.
Run npm install, npm run lint, npm run test:policies and npm run build before release.
The policy tests run in an isolated local Postgres-compatible engine, not production.
Verify live login, denied non-admin writes, admin create/edit/delete, refresh and empty gallery.
Do not test delete-all on production content.

Images are stored separately. Removing a canvas/image detaches it; unused storage objects are retained
to avoid accidentally removing shared assets. Clean up confirmed unused objects in Storage as needed.
