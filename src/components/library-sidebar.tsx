'use client';

import { useEffect, useState } from 'react';
import { FlashcardSet } from '@prisma/client';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

interface LibrarySet extends FlashcardSet {
  flashcards: { id: string }[];
}

export function LibrarySidebar() {
  const [mySets, setMySets] = useState<LibrarySet[]>([]);
  const [studyingSets, setStudyingSets] = useState<LibrarySet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const currentSetId = params.id;

  useEffect(() => {
    async function fetchLibrarySets() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/sets?type=mine');
        if (response.ok) {
          const data = await response.json();
          setMySets(data.sets || []);
          setStudyingSets(data.studying || []);
        }
      } catch (error) {
        console.error('Failed to fetch library sets', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLibrarySets();
  }, []);

  const renderSetList = (sets: LibrarySet[]) => {
    if (sets.length === 0) {
      return null;
    }
    return sets.map((set) => (
      <Link
        key={set.id}
        href={`/sets/${set.id}`}
        className={cn(
          'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-all text-muted-foreground',
          currentSetId === set.id
            ? 'bg-muted font-semibold'
            : 'hover:bg-muted/80 hover:text-foreground'
        )}
      >
        <span className="truncate">{set.title}</span>
      </Link>
    ));
  };
  
  return (
    <Card className="rounded-xl p-4 py-6 shadow-none">
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold mb-2 px-2">My Sets</h2>
          <nav className="flex flex-col gap-1">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
            {!isLoading && mySets.length === 0 && <p className="px-2 text-sm text-muted-foreground">No sets yet.</p>}
            {renderSetList(mySets)}
          </nav>
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-2 px-2">Studying</h2>
          <nav className="flex flex-col gap-1">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
            {!isLoading && studyingSets.length === 0 && <p className="px-2 text-sm text-muted-foreground">No sets being studied.</p>}
            {renderSetList(studyingSets)}
          </nav>
        </div>
      </div>
    </Card>
  );
} 