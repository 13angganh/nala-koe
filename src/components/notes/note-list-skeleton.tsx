import { NoteCardSkeleton } from './note-card-skeleton';

interface NoteListSkeletonProps {
  count?: number;
}

export function NoteListSkeleton({ count = 6 }: NoteListSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      aria-busy="true"
      aria-label="Memuat catatan…"
    >
      {Array.from({ length: count }, (_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  );
}
