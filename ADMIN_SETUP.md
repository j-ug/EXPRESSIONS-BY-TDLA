# Admin setup

Admin access is controlled by a Firebase Authentication custom claim. No admin
password or admin email is shipped to the browser.

1. Create the curator account in Firebase Authentication (Email/Password).
2. From a trusted Firebase Admin SDK environment, set the claim on that user:

   ```js
   await getAuth().setCustomUserClaims(uid, { admin: true });
   ```

3. Deploy `firestore.rules` with the Firebase CLI.
4. Sign out and sign in again so Firebase refreshes the ID token.

For the full Google AI Studio sync and Netlify deployment workflow, follow
`AI_STUDIO_HANDOFF.md`.

Only users whose verified token contains `admin: true` can create, edit, or
delete artwork documents. Regular visitors retain read-only access.
