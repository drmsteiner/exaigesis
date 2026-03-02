import {
  initializeApp,
  getApps,
  cert,
  ServiceAccount,
  App,
} from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

/**
 * Firebase Admin SDK for server-side operations
 *
 * Used in:
 * - API routes
 * - Server components
 * - Cloud Functions
 *
 * IMPORTANT: These credentials must NEVER be exposed client-side.
 * Store them in environment variables only available server-side.
 */

let app: App;
let adminAuth: Auth;
let adminDb: Firestore;
let adminStorage: Storage;

function initializeAdmin() {
  if (getApps().length === 0) {
    // In development, use service account credentials
    // In production (Firebase Hosting/Functions), uses default credentials
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Replace escaped newlines in the private key
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        ),
      };

      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`,
      });
    } else {
      // Use application default credentials (in Cloud Functions or Cloud Run)
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }

  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
  adminStorage = getStorage(app);
}

// Initialize on module load
initializeAdmin();

export { adminAuth, adminDb, adminStorage };
