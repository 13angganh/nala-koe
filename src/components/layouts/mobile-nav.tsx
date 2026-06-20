'use client';

import Link from 'next/link';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { SidebarNav } from './sidebar-nav';
import { ROUTES } from '@/constants/routes';
import { NalaKoeLogo } from '@/components/shared/nalakoe-logo';

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
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f172a] text-white shrink-0">
                <NalaKoeLogo size={16} />
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
