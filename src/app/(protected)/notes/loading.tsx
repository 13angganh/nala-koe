import { NoteListSkeleton } from '@/components/notes/note-list-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotesLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <NoteListSkeleton count={6} />
    </div>
  );
}
