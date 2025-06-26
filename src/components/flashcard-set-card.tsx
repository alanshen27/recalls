'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { StarRating } from './star-rating';

interface SetData {
  id: string;
  title: string;
  flashcards: { id: string }[];
  labels: string | null;
  isStudying: boolean;
  rating: {
    average: number;
    count: number;
  };
}

interface FlashcardSetCardProps {
  set: SetData;
  className?: string;
  onStudyingChange: (setId: string, isStudying: boolean) => void;
}

export function FlashcardSetCard({ set, className, onStudyingChange }: FlashcardSetCardProps) {
  const [isStudying, setIsStudying] = useState(set.isStudying);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStudyingClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubmitting(true);
    
    const newStudyingState = !isStudying;
    
    try {
      const response = await fetch(`/api/sets/${set.id}/studying`, {
        method: newStudyingState ? 'POST' : 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update studying status.');
      }

      setIsStudying(newStudyingState);
      onStudyingChange(set.id, newStudyingState);
      toast.success(newStudyingState ? 'Added to your studying list.' : 'Removed from your studying list.');

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:bg-muted/50',
        className
      )}
      onClick={() => (window.location.href = `/sets/${set.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{set.title}</CardTitle>
          <button
            onClick={handleStudyingClick}
            disabled={isSubmitting}
            className="p-1 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
          >
            <Bookmark className={cn('h-5 w-5', { 'fill-primary text-primary': isStudying })} />
          </button>
        </div>
        <CardDescription className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <StarRating rating={set.rating.average} size={14} readOnly />
            <span className="font-bold text-foreground ml-1">
              {set.rating.average.toFixed(1)}
            </span>
            <span>({set.rating.count})</span>
          </div>
          <span>·</span>
          <span>{set.flashcards.length} cards</span>
        </CardDescription>
        <div className="flex flex-wrap gap-1 pt-2 min-h-[30px] items-center">
          {(() => {
            const tags = set.labels
              ? set.labels.split(',').map((t) => t.trim()).filter(Boolean)
              : [];
            if (tags.length > 0) {
              return tags.map((label) => (
                <span
                  key={label}
                  className="px-1.5 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                >
                  {label}
                </span>
              ));
            }
            return (
              <span className="text-xs text-muted-foreground italic">
                No tags
              </span>
            );
          })()}
        </div>
      </CardHeader>
    </Card>
  );
} 