import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { env } from './env';

const firebaseConfig = {
  apiKey:            env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // storageBucket dihapus — Firebase Storage tidak dipakai (perlu plan Blaze)
  // databaseURL opsional — hanya diisi jika RTDB diaktifkan
  ...(env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    ? { databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL }
    : {}),
};

// Singleton pattern — prevent duplicate Firebase app initialization
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
// rtdb hanya diinisialisasi jika NEXT_PUBLIC_FIREBASE_DATABASE_URL tersedia
let rtdb: Database | null = null;

function initFirebase(): void {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe: checked above
    app = getApps()[0]!;
  }

  auth = getAuth(app);

  // Aktifkan offline persistence dengan IndexedDB.
  // persistentMultipleTabManager: data tersedia di semua tab secara bersamaan.
  // Hanya di browser — SSR tetap pakai getFirestore biasa.
  if (typeof window !== 'undefined') {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } else {
    db = getFirestore(app);
  }

  // RTDB: hanya inisialisasi jika databaseURL tersedia di env
  if (env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
    rtdb = getDatabase(app);
  }
}

// Initialize immediately
initFirebase();

export { auth, db, rtdb };
export type { FirebaseApp, Auth, Firestore, Database };
