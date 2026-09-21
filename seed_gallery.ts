import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load config to get Project ID
const configPath = join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

// Initialize Firebase Admin
initializeApp({
  projectId: config.projectId
});

const auth = getAuth();
// Explicitly use the provisioned database ID
const db = getFirestore(config.firestoreDatabaseId || '(default)');

const EMAIL = 'ophyliagodwin@gmail.com';
const PASSWORD = 'Jeswin@30';
const DISPLAY_NAME = 'Dr. Ophylia Godwin';

async function setup() {
  try {
    console.log(`Attempting to set up admin account for ${EMAIL}...`);
    
    try {
      let user;
      try {
        user = await auth.getUserByEmail(EMAIL);
        console.log('User already exists, updating password and claims...');
        await auth.updateUser(user.uid, {
          password: PASSWORD,
          displayName: DISPLAY_NAME
        });
      } catch (e) {
        console.log('Creating new user...');
        user = await auth.createUser({
          email: EMAIL,
          password: PASSWORD,
          displayName: DISPLAY_NAME,
          emailVerified: true
        });
      }

      await auth.setCustomUserClaims(user.uid, { admin: true });
      console.log(`Admin claim set for UID: ${user.uid}`);
    } catch (authError: any) {
      console.warn('Firebase Auth Setup failed (Authentication might not be enabled in console):', authError.message);
      console.warn('Skipping Auth setup, proceeding to Firestore seeding...');
    }

    console.log('Checking existing artworks...');
    const artworksCol = db.collection('artworks');
    const snapshot = await artworksCol.limit(1).get();
    
    if (!snapshot.empty) {
      console.log('Database already has artworks. Skipping bulk seeding to avoid duplicates.');
    } else {
      console.log('Seeding 20 blank canvases...');
      for (let i = 1; i <= 20; i++) {
        const artwork = {
          title: `Botanical Specimen #${i.toString().padStart(2, '0')}`,
          tamilTitle: '',
          botanicalSpecies: ['Unidentified specimen'],
          medium: 'Pressed leaf on handmade paper',
          dimensions: '70 × 55 cm',
          year: '2024',
          price: '₹18,500',
          frameShape: 'rectangle',
          biasLightColor: '#608050',
          biasLightIntensity: 2.0,
          description: 'A blank canvas waiting for botanical curation. This specimen preserves the organic venation of indigenous flora.',
          inspiration: 'The sacred riverbanks of the Kaveri basin.',
          panelPosition: 'below',
          textureTheme: 'peepal_sacred',
          createdAt: new Date().toISOString()
        };
        
        await artworksCol.add(artwork);
        console.log(`Added canvas ${i}/20`);
      }
    }

    console.log('Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup();
