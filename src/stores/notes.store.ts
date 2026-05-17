import { create }   from 'zustand';
import type { Note, NoteListItem, NoteFilters } from '@/types/note.types';

interface NotesStore {
  // List
  notes:              NoteListItem[];
  setNotes:           (notes: NoteListItem[]) => void;
  addNote:            (note: NoteListItem) => void;
  updateNoteInList:   (id: string, partial: Partial<NoteListItem>) => void;
  removeNoteFromList: (id: string) => void;

  // Current note (editor)
  activeNote:       Note | null;
  setActiveNote:    (note: Note | null) => void;
  updateActiveNote: (partial: Partial<Note>) => void;

  // Filters
  filters:      NoteFilters;
  setFilters:   (filters: Partial<NoteFilters>) => void;
  resetFilters: () => void;

  // Loading states
  isListLoading: boolean;
  isNoteLoading: boolean;
  isSaving:      boolean;
  setListLoading:(v: boolean) => void;
  setNoteLoading:(v: boolean) => void;
  setSaving:     (v: boolean) => void;

  // Optimistic checklist toggle
  toggleChecklistItem: (noteId: string, blockId: string, itemId: string) => void;
}

const DEFAULT_FILTERS: NoteFilters = {
  status:        'active',
  sort:          'updatedAt',
  sortDirection: 'desc',
};

export const useNotesStore = create<NotesStore>()((set) => ({
  notes: [],
  setNotes: (notes) =>
    set({ notes }, false, 'notes/setNotes'),

  addNote: (note) =>
    set(
      (s) => ({
        notes: note.isPinned
          ? [note, ...s.notes]
          : [...s.notes.filter((n) => n.isPinned), note, ...s.notes.filter((n) => !n.isPinned)],
      }),
      false,
      'notes/addNote'
    ),

  updateNoteInList: (id, partial) =>
    set(
      (s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...partial } : n)) }),
      false,
      'notes/updateNoteInList'
    ),

  removeNoteFromList: (id) =>
    set(
      (s) => ({ notes: s.notes.filter((n) => n.id !== id) }),
      false,
      'notes/removeNoteFromList'
    ),

  activeNote: null,
  setActiveNote: (note) =>
    set({ activeNote: note }, false, 'notes/setActiveNote'),

  updateActiveNote: (partial) =>
    set(
      (s) => ({ activeNote: s.activeNote ? { ...s.activeNote, ...partial } : null }),
      false,
      'notes/updateActiveNote'
    ),

  filters: { ...DEFAULT_FILTERS },
  setFilters: (filters) =>
    set(
      (s) => ({ filters: { ...s.filters, ...filters } }),
      false,
      'notes/setFilters'
    ),
  resetFilters: () =>
    set({ filters: { ...DEFAULT_FILTERS } }, false, 'notes/resetFilters'),

  isListLoading: false,
  isNoteLoading: false,
  isSaving:      false,
  setListLoading: (v) => set({ isListLoading: v }, false, 'notes/setListLoading'),
  setNoteLoading: (v) => set({ isNoteLoading: v }, false, 'notes/setNoteLoading'),
  setSaving:      (v) => set({ isSaving: v },      false, 'notes/setSaving'),

  toggleChecklistItem: (noteId, blockId, itemId) =>
    set(
      (s) => {
        if (!s.activeNote || s.activeNote.id !== noteId) return s;
        const blocks = s.activeNote.blocks.map((block) => {
          if (block.id !== blockId || block.type !== 'checklist') return block;
          try {
            const items = JSON.parse(block.content) as Array<{
              id: string; text: string; isChecked: boolean;
            }>;
            const updated = items.map((item) =>
              item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
            );
            return { ...block, content: JSON.stringify(updated) };
          } catch {
            return block;
          }
        });
        return { activeNote: { ...s.activeNote, blocks } };
      },
      false,
      'notes/toggleChecklistItem'
    ),
}));
