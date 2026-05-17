'use client';

import { useMemo } from 'react';
import type { NoteListItem } from '@/types/note.types';

export type SmartFolderKey =
  | 'pinned'
  | 'today'
  | 'this-week'
  | 'with-checklist'
  | 'with-links'
  | 'long-notes'
  | 'untagged';

export interface SmartFolder {
  key: SmartFolderKey;
  label: string;
  description: string;
  count: number;
  noteIds: string[];
}

function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

export function useSmartFolders(notes: NoteListItem[]): SmartFolder[] {
  return useMemo(() => {
    const pinned = notes.filter((n) => n.isPinned);
    const today = notes.filter((n) => isToday(n.updatedAt));
    const thisWeek = notes.filter((n) => isThisWeek(n.updatedAt) && !isToday(n.updatedAt));
    const withChecklist = notes.filter((n) => n.content.includes('[x]') || n.content.includes('[ ]'));
    const withLinks = notes.filter((n) => n.linkedNoteIds.length > 0);
    const longNotes = notes.filter((n) => n.wordCount >= 300);
    const untagged = notes.filter((n) => n.tags.length === 0);

    const folders: SmartFolder[] = [
      {
        key: 'pinned',
        label: 'Disematkan',
        description: 'Catatan yang kamu sematkan',
        count: pinned.length,
        noteIds: pinned.map((n) => n.id),
      },
      {
        key: 'today',
        label: 'Hari Ini',
        description: 'Diperbarui hari ini',
        count: today.length,
        noteIds: today.map((n) => n.id),
      },
      {
        key: 'this-week',
        label: 'Minggu Ini',
        description: 'Diperbarui minggu ini',
        count: thisWeek.length,
        noteIds: thisWeek.map((n) => n.id),
      },
      {
        key: 'with-checklist',
        label: 'Punya Checklist',
        description: 'Catatan berisi item tugas',
        count: withChecklist.length,
        noteIds: withChecklist.map((n) => n.id),
      },
      {
        key: 'with-links',
        label: 'Catatan Terhubung',
        description: 'Punya tautan ke catatan lain',
        count: withLinks.length,
        noteIds: withLinks.map((n) => n.id),
      },
      {
        key: 'long-notes',
        label: 'Catatan Panjang',
        description: 'Lebih dari 300 kata',
        count: longNotes.length,
        noteIds: longNotes.map((n) => n.id),
      },
      {
        key: 'untagged',
        label: 'Tanpa Tag',
        description: 'Belum diberi label apapun',
        count: untagged.length,
        noteIds: untagged.map((n) => n.id),
      },
    ];

    return folders.filter((f) => f.count > 0);
  }, [notes]);
}
