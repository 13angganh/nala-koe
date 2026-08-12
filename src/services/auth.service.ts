import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ok, err } from '@/lib/normalizer';
import type { ApiResult } from '@/types/api.types';
import { DEFAULT_PREFERENCES } from '@/types/user.types';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: DEFAULT_PREFERENCES,
    });
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<ApiResult<User>> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    logger.info('auth.login.email', { uid: credential.user.uid });
    return ok(credential.user);
  } catch (error) {
    logger.error('auth.login.email.failed', { error });
    return err('auth/login-failed', mapFirebaseError(error));
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<ApiResult<User>> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    await ensureUserProfile(credential.user);
    logger.info('auth.register.email', { uid: credential.user.uid });
    return ok(credential.user);
  } catch (error) {
    logger.error('auth.register.email.failed', { error });
    return err('auth/register-failed', mapFirebaseError(error));
  }
}

export async function loginWithGoogle(): Promise<ApiResult<User>> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(credential.user);
    logger.info('auth.login.google', { uid: credential.user.uid });
    return ok(credential.user);
  } catch (error) {
    logger.error('auth.login.google.failed', { error });
    return err('auth/google-failed', mapFirebaseError(error));
  }
}

export async function logout(): Promise<ApiResult<void>> {
  try {
    await signOut(auth);
    logger.info('auth.logout');
    return ok(undefined);
  } catch (error) {
    logger.error('auth.logout.failed', { error });
    return err('auth/logout-failed', 'Gagal keluar. Coba lagi.');
  }
}

export async function sendResetEmail(email: string): Promise<ApiResult<void>> {
  try {
    await sendPasswordResetEmail(auth, email);
    return ok(undefined);
  } catch (error) {
    logger.error('auth.reset.failed', { error });
    return err('auth/reset-failed', mapFirebaseError(error));
  }
}

function mapFirebaseError(error: unknown): string {
  const code = (error as { code?: string }).code;
  const map: Record<string, string> = {
    'auth/user-not-found': 'Email tidak ditemukan.',
    'auth/wrong-password': 'Password salah.',
    'auth/email-already-in-use': 'Email sudah digunakan.',
    'auth/weak-password': 'Password terlalu lemah.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/popup-closed-by-user': 'Login Google dibatalkan.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba beberapa saat lagi.',
    'auth/network-request-failed': 'Periksa koneksi internetmu.',
    'auth/invalid-credential': 'Email atau password salah.',
    // Added — these are common Google/popup-based sign-in failures that
    // were previously falling through to the generic "Terjadi kesalahan.
    // Coba lagi." (reported bug: Google login shows a generic error with
    // no way to tell what actually went wrong).
    'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk situs ini, lalu coba lagi.',
    'auth/cancelled-popup-request': 'Ada proses login lain yang sedang berjalan. Coba lagi.',
    'auth/unauthorized-domain': 'Domain ini belum diizinkan untuk login Google. Hubungi admin.',
    'auth/account-exists-with-different-credential':
      'Email ini sudah terdaftar dengan metode login lain (misal password). Coba masuk dengan email & password.',
    'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
    'auth/internal-error': 'Terjadi kesalahan internal Firebase. Coba lagi sebentar lagi.',
  };
  if (code !== undefined && map[code] !== undefined) return map[code];
  // Unmapped error codes used to all collapse into an identical, unhelpful
  // "Terjadi kesalahan. Coba lagi." — impossible to tell apart from a
  // toast alone (this is the reported "login Google muncul pesan terjadi
  // kesalahan" bug: it's not that login always fails the same way, it's
  // that every DIFFERENT failure reason displayed the same generic text).
  // Including the raw code makes the actual cause visible to whoever sees
  // the toast, and to `logger.error` calls elsewhere that already log this
  // string as message context.
  return code !== undefined ? `Terjadi kesalahan (${code}). Coba lagi.` : 'Terjadi kesalahan. Coba lagi.';
}
