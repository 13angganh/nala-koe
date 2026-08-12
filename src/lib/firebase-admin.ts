/**
 * Firebase Admin SDK — SERVER SIDE ONLY.
 * Safe to import in: app/api/[route]/route.ts, Server Components.
 * Firebase Storage tidak diinisialisasi — tidak dipakai (perlu plan Blaze).
 *
 * Credentials read from env vars (FIREBASE_ADMIN_CLIENT_EMAIL,
 * FIREBASE_ADMIN_PRIVATE_KEY) since v1.2.4. Previously hardcoded directly
 * in this file — a security incident found and fixed after this repo was
 * confirmed public on GitHub. See README.md changelog v1.2.3/v1.2.4 for
 * the full writeup. projectId stays a plain constant: it's not a secret
 * (it's visible in every Firestore REST URL and in the client config in
 * firebase.ts), so there's no benefit to routing it through env vars too.
 */
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { env, getFirebaseAdminPrivateKey } from '@/lib/env';

const serviceAccount = {
  projectId: 'nala-koe',
  get clientEmail() {
    return env.FIREBASE_ADMIN_CLIENT_EMAIL;
  },
  get privateKey() {
    return getFirebaseAdminPrivateKey();
  },
};

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function initAdmin(): void {
  const apps = getApps();
  if (apps.length === 0) {
    adminApp = initializeApp({ credential: cert(serviceAccount) });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe: checked above
    adminApp = apps[0]!;
  }
  adminDb   = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
}

initAdmin();

export { adminDb, adminAuth };
