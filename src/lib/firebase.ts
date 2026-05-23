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

// Firebase client config — hardcoded (public keys, aman di client-side)
const firebaseConfig = {
  apiKey:            'AIzaSyBU8mNtvsOUhBYTwyg6cNBjkxT_vqK8XYo',
  authDomain:        'nala-koe.firebaseapp.com',
  projectId:         'nala-koe',
  messagingSenderId: '904590595183',
  appId:             '1:904590595183:web:de30c46a69746f34fce99a',
  // storageBucket tidak dipakai (perlu plan Blaze)
  // databaseURL tidak dipakai (RTDB belum diaktifkan)
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let rtdb: Database | null = null;

function initFirebase(): void {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- safe: checked above
    app = getApps()[0]!;
  }

  auth = getAuth(app);

  if (typeof window !== 'undefined') {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } else {
    db = getFirestore(app);
  }
}

initFirebase();

export { auth, db, rtdb };
export type { FirebaseApp, Auth, Firestore, Database };
