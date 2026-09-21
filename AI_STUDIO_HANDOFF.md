# AI Studio handoff: Supabase migration

Copy this prompt into Google AI Studio:

> Sync the latest Supabase migration branch/PR for j-ug/EXPRESSIONS-BY-TDLA, preserving any newer work.
> Firebase has been replaced with Supabase Auth, Postgres and Storage. Follow ADMIN_SETUP.md.
> Use VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY only; never expose privileged keys.
> Apply supabase/migrations/202609210001_gallery.sql once to the confirmed project.
> Create a confirmed curator through Supabase Authentication and grant its UUID membership in
> gallery_admins through SQL Editor. Never infer admin rights from email, localStorage, or user metadata.
> Public users may read artworks; RLS must protect all mutations and image uploads.
> Keep manual login with no admin autofill. Await saves before reporting success.
> Preserve empty galleries and optional-field deletion. Never automatically seed/prune/import content.
> Import the approved legacy artwork export through the dashboard before production cutover.
> Keep Firebase cloud data intact until migration has been verified; do not silently delete it.
> Configure Supabase Auth Site URL/redirect allowlist for Netlify. Configure custom SMTP before
> enabling public email signup; the default sender is not a production email service.
> Preserve netlify.toml. Set both public Supabase build variables in Netlify and rebuild.
> Run npm install, npm run lint, npm run test:policies, and npm run build.
> Commit/push verified changes and report the PR/commit, tests, project setup and deployment status.
> Do not claim setup, data transfer or deployment succeeded unless verified.
