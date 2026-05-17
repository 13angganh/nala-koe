'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
}

/**
 * Tracks online/offline status and shows toast notifications on change.
 * Mount this hook once in the root layout via <NetworkStatus />.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    toast.success('Kembali online', {
      description: 'Catatan kamu akan disinkronkan.',
      duration: 3000,
    });
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    toast.warning('Kamu sedang offline', {
      description: 'Perubahan akan disimpan lokal dan disinkronkan saat online.',
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, isOffline: !isOnline };
}
