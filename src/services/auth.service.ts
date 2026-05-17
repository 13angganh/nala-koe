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
  };
  return (code !== undefined && map[code] !== undefined ? map[code] : 'Terjadi kesalahan. Coba lagi.') as string;
}
