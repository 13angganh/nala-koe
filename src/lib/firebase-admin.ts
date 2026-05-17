/**
 * Firebase Admin SDK — SERVER SIDE ONLY.
 * Never import this file in client-side components or hooks.
 * This file is safe to import in:
 *   - app/api/[route]/route.ts
 *   - Server Components (if needed)
 *
 * Firebase Storage tidak diinisialisasi — tidak dipakai di app ini
 * (Storage memerlukan plan Blaze/berbayar).
 */
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { env } from './env';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function initAdmin(): void {
  const apps = getApps();
  if (apps.length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId:   env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Firebase stores private key with literal \n — replace with actual newlines
        privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe: checked above
    adminApp = apps[0]!;
  }
  adminDb   = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
}

initAdmin();

export { adminDb, adminAuth };
