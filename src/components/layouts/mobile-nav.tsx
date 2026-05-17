'use client';

import Link from 'next/link';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { SidebarNav } from './sidebar-nav';
import { ROUTES } from '@/constants/routes';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent side="left" showClose>
        <DrawerHeader>
          <DrawerTitle>
            <Link
              href={ROUTES.DASHBOARD}
              onClick={onClose}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              NalaKoe
            </Link>
          </DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto">
          <SidebarNav onNavigate={onClose} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
