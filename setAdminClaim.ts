import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load config to get Project ID
const configPath = join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

// Initialize Firebase Admin
// In AI Studio environment, we try to use default credentials
initializeApp({
  projectId: config.projectId
});

const auth = getAuth();

const setAdmin = async (uid: string) => {
  try {
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set admin claim for user: ${uid}`);
    console.log('User must sign out and sign in again (or refresh token) to receive the new claim.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  }
};

const uid = process.argv[2];
if (!uid) {
  console.error('Please provide a User UID as an argument.');
  console.log('Usage: npx tsx setAdminClaim.ts <USER_UID>');
  process.exit(1);
}

setAdmin(uid);
