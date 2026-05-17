'use client';

import { useNetworkStatus } from '@/hooks';

/**
 * Mount once in the root layout. Listens for online/offline events and
 * shows toast notifications. No UI rendered — purely side-effect component.
 */
export function NetworkStatus() {
  useNetworkStatus();
  return null;
}
