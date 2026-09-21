# Google AI Studio handoff

This repository now uses Firebase Authentication and Firestore as the source of
truth for gallery canvases. Pull the latest commit from
`codex/secure-admin-gallery-management` (or `main` after PR #1 is merged) before
making further changes in Google AI Studio.

## Copy this prompt into Google AI Studio

```text
Sync this app from the latest GitHub commit for j-ug/EXPRESSIONS-BY-TDLA.
The admin and gallery-management implementation has changed. Preserve these
requirements:

1. Use Firebase Email/Password Authentication. Never hard-code or display an
   admin email or password and never add an admin-autofill button.
2. Treat a Firebase ID-token custom claim of admin: true as the only source of
   admin authorization. Do not infer admin access from an email address or from
   localStorage.
3. Public visitors may read artworks. Only a verified admin may create, edit,
   delete, or delete all artwork documents.
4. Keep Firestore as the authoritative artwork store. localStorage is only an
   offline rendering cache. Do not restore the previous five-artwork limit or
   automatically prune artworks.
5. Preserve firestore.rules, firebase.json, and netlify.toml.
6. Run npm install, npm run lint, and npm run build after every change.
7. Do not commit Firebase service-account JSON, private keys, passwords, or
   Netlify tokens. Only VITE_FIREBASE_* public web configuration values belong
   in the Netlify environment-variable UI.

Before reporting completion, show the changed files, confirm the production
build passes, and commit/push the changes to the connected GitHub repository.
```

## One-time Firebase setup

### 1. Enable authentication

In Firebase Console, open **Authentication → Sign-in method**, enable
**Email/Password**, then create the curator account under **Users**. Do not put
its password in source code, an AI Studio prompt, or GitHub.

### 2. Assign the admin custom claim

Custom claims must be set from a trusted Admin SDK environment, not from this
browser app. Open Google Cloud Shell for the same Firebase project and run the
following, replacing both placeholders:

```bash
mkdir -p /tmp/gallery-admin && cd /tmp/gallery-admin
npm init -y
npm install firebase-admin
export FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
export CURATOR_EMAIL="YOUR_CURATOR_EMAIL"
node --input-type=module <<'EOF'
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
const user = await getAuth().getUserByEmail(process.env.CURATOR_EMAIL);
await getAuth().setCustomUserClaims(user.uid, { admin: true });
console.log(`Admin access enabled for ${user.email}`);
EOF
```

The curator must sign out and sign in again after this step so Firebase issues a
new ID token containing the claim.

### 3. Deploy Firestore rules

From the synced repository terminal in AI Studio (or Cloud Shell):

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules
```

Select the same Firebase project used by the app. The included rules allow
public artwork reads and require `request.auth.token.admin == true` for artwork
creates, updates, and deletes.

### 4. Verify Firebase configuration

Confirm these variables are configured in the AI Studio project and later in
Netlify:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Git sync workflow in AI Studio

1. Merge GitHub PR #1, or check out `codex/secure-admin-gallery-management`.
2. In AI Studio, reconnect/reload the GitHub repository and pull the latest
   commit before editing.
3. Ask AI Studio to retain the security requirements in the prompt above.
4. After changes, run `npm run lint` and `npm run build`.
5. Commit and push from AI Studio to a feature branch, then merge through a pull
   request. Pull again before starting the next AI Studio session.

## Deploy to Netlify from GitHub

1. In Netlify select **Add new site → Import an existing project → GitHub**.
2. Choose `j-ug/EXPRESSIONS-BY-TDLA` and the deployment branch (`main` after the
   pull request is merged).
3. `netlify.toml` supplies the build command (`npm run build`), publish folder
   (`dist`), Node version, and SPA redirect.
4. In **Site configuration → Environment variables**, add every
   `VITE_FIREBASE_*` value listed above. Trigger a fresh deploy after saving.
5. Copy the final Netlify hostname, then add it in Firebase Console under
   **Authentication → Settings → Authorized domains**. Add a custom domain there
   too if one is connected later.
6. Test regular sign-up/sign-in, admin sign-in, add/edit/delete, delete-all, a
   page refresh, and a private/incognito browser session.

Netlify receives future deployments automatically whenever a new commit reaches
the configured production branch.
