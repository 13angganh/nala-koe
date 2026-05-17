'use client';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { NoteSort, NoteSortDirection } from '@/types/note.types';

const SORT_OPTIONS: { value: NoteSort; label: string }[] = [
  { value: 'updatedAt', label: 'Terakhir diubah' },
  { value: 'createdAt', label: 'Tanggal dibuat' },
  { value: 'title', label: 'Judul (A–Z)' },
  { value: 'wordCount', label: 'Jumlah kata' },
];

interface NoteSortProps {
  sort: NoteSort;
  sortDirection: NoteSortDirection;
  onSortChange: (sort: NoteSort) => void;
  onDirectionChange: (dir: NoteSortDirection) => void;
}

export function NoteSort({ sort, sortDirection, onSortChange, onDirectionChange }: NoteSortProps) {
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Urutkan';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
          {currentLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs">Urutkan berdasarkan</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sort} onValueChange={(v) => onSortChange(v as NoteSort)}>
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value} className="text-sm">
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Arah</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={sortDirection}
          onValueChange={(v) => onDirectionChange(v as NoteSortDirection)}
        >
          <DropdownMenuRadioItem value="desc" className="text-sm">
            Terbaru dulu
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="asc" className="text-sm">
            Terlama dulu
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
