# Mengaktifkan Firebase RTDB

RTDB saat ini **belum aktif**. `firebase.json` tidak menyertakan `database` entry
karena `getDatabase()` belum diinisialisasi di `src/lib/firebase.ts`.

## Langkah aktivasi jika dibutuhkan:

1. Tambahkan `databaseURL` ke `firebaseConfig` di `src/lib/firebase.ts`
2. Import dan ekspor `rtdb`:

```ts
import { getDatabase, type Database } from 'firebase/database';
let rtdb: Database;
// di dalam initFirebase():
rtdb = getDatabase(app);
// di bagian export:
export { auth, db, storage, rtdb };
```

3. Tambahkan ke `src/lib/env.ts`:
```ts
NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url(),
```

4. Tambahkan ke `.env.local`:
```
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

5. Re-aktifkan di `firebase.json`:
```json
"database": { "rules": "database.rules.json" }
```

6. Deploy rules: `firebase deploy --only database`

File `database.rules.json` sudah tersedia dengan UID whitelist.
