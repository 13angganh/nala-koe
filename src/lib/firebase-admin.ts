/**
 * Firebase Admin SDK — SERVER SIDE ONLY.
 * Safe to import in: app/api/[route]/route.ts, Server Components.
 * Firebase Storage tidak diinisialisasi — tidak dipakai (perlu plan Blaze).
 */
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

// Admin credentials — server-side only, tidak pernah dikirim ke client
const serviceAccount = {
  projectId:   'nala-koe',
  clientEmail: 'firebase-adminsdk-fbsvc@nala-koe.iam.gserviceaccount.com',
  privateKey:  '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFStPlFaS3lbaL\nhedzAdwqhzAQdmaEpGPEJ7A6eyXK8oOc9LQSGwMu8aEnh4pSADkfogNiDp4jZImV\n8MNAl3P6glUHCxJdNXBxbWuUZ4roLVc98uy7nj99k26f4jq+ioZ317TBhvXojf3P\n43gBGh5VcG2uFwacVSr9+a7JiwbPo91kay+4StBSiIRLRCDSWnqKJO66gkYu89Gs\n7rQEP37TyVw9EPIim6y3luIQQsVc+fFEfG8KV3r9N6pdZ0IxIiFPZ0ZEtcupWvjg\n/F5uEYVDqjHhGbnPp7qRfWu5EMvhEbryFOYZ1PPFNkDDKCbqnuAfUeSyL2hCnw0r\nzg0Uj+9RAgMBAAECggEABYx+beAQUNZcv3jTbkOzDnABWbQJpNAZ8e90G+asDfAb\nLV9p7xr/h0eKm/5csJ+T+7b9ShU6KmCFbT8U5r7ylOPiOQiPeCl+9eLduza3ujSs\n0maSK8awsJaJAMDiCjjd4b1rkfYfQyWAV77S0//2spV4HxcfIB5V89pBYJR1WRTo\nmpEapbR+TgDvzLH/RGmtj6TWDaUMSFRO9e/DeE/ApdqQAkWnvoTrB34pKDmFbfed\nRgDka6JLKD5kJfGq+I3NMzGQOAlzC8VtjxVh0fh90GZKWDwVIq6n25RjGMH4ufMH\nQE46Z3+fsFZq70ilMKzdL0jEINCu0bRvNoqdH2kZqQKBgQDpRbAdG49+NrqVxR1L\nHoJyeAqHHixncRVjhOzVQBc/rdecqEGVeWT9H2bKyf2cwrOwZxmDFzDRdE1zo+T8\nSGRGZxzsTz4U1eTKS4No3a2BU/SJzUHe2Mk05cW0aKkYg0uDWwede664IVpVTq1s\nietkO4Vx/VklrBseE//EQeDf1QKBgQDYg7kRm2SLVK9k0XoabMA3RIif33Ggw+DF\nXRdAhd1pYAyxHD4VQiLlyHRprj4af0jPKKkSEiSUAw9chmdj6GqEVNMPFZtRRLVc\nHh3VGsTZntewmIVaqicdgIJl+aPrr7ZlUS8sQ1o9grCUJVyc45Xe5XE9nsARqlnc\nw13Aq3yLjQKBgCtSSNmvA6AR8+bam40W1m0BxBrBzMdNJga8aetUorytwUwTp1Jm\nIA4uJb3lc1cIhaxuCTviM6vCaJvgRSdhHlZA0gtE0Ce4bWvwSDBScuWAvPpWhzQm\nmH9daLEPes/VmlGDt09U5+bEMu2C1gxBNNkBgM/hmAu6AbM9TZOaFHQdAoGBAJzZ\niBfGP+dj+RALZO6BvBoNrwBKifGSFWJFFxQqJgUxjOA9eohB+jAGsLbigKEHdsKE\nTT8HH7KOKPG5eGr7MzcckC3MVFFiehP6yVfZZaPVm6GWTH0q6N1JfK3NVL/n8jWh\nw4/IVzZaV/tquZX6lVb9VrTyLWhexWzVpzRtxvL9AoGASFD3atfAy88CHCWX7xe0\nimezTTMImfHK4uTtGePw6NlSLlGFaeSX8waWpdl8UzsrZbCROJZbzqJalQK0cvdu\nMeeY2T+7LfkIhmZGdbUW7eflekzJ/w03Y8OtCP6YuB2DbYn6Y0RmmeRcn1NkhrVi\nuh6Pme2sIfmuTflkwkVRUhI=\n-----END PRIVATE KEY-----\n',
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
