'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { FlashcardSet, Flashcard, User } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, Edit, BookOpen, ClipboardCheck, Users, X, Bookmark, Globe, Lock, Trash } from "lucide-react";
import Link from 'next/link';
import { ShareSetDialog } from "@/components/share-set-dialog";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { LibrarySidebar } from '@/components/library-sidebar';
import { cn } from '@/lib/utils';
import { StarRating } from '@/components/star-rating';
import { SetPageLoading } from '@/components/set-page-loading';

interface SetWithRelations extends FlashcardSet {
  flashcards: Flashcard[];
  sharedWith: {
    sharedWith: User;
  }[];
  isStudying: boolean;
  rating: {
    average: number;
    count: number;
    userRating: number;
  };
  public: boolean;
}

export default function SetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [set, setSet] = useState<SetWithRelations | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<'term' | 'definition'>('term');
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarKey, setSidebarKey] = useState(0);
  
  const fetchSet = async () => {
    try {
      const response = await fetch(`/api/sets/${id}`);
      if (!response.ok) throw new Error('Failed to fetch set');
      const data = await response.json();
      setSet(data);
      setIsStudying(data.isStudying);
    } catch (error) {
      console.error('Error fetching set:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSet();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setStudyMode(prev => prev === 'term' ? 'definition' : 'term');
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
        setStudyMode('term');
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => (prev < (set?.flashcards.length || 0) - 1 ? prev + 1 : prev));
        setStudyMode('term');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [set?.flashcards.length]);

  const handleStudyingClick = async () => {
    setIsSubmitting(true);
    const newStudyingState = !isStudying;

    try {
      const response = await fetch(`/api/sets/${id}/studying`, {
        method: newStudyingState ? 'POST' : 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to update studying status.');
      }

      setIsStudying(newStudyingState);
      setSidebarKey(prev => prev + 1);
      toast.success(newStudyingState ? 'Added to your studying list.' : 'Removed from your studying list.');

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRate = async (rating: number) => {
    try {
      const response = await fetch(`/api/sets/${id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit rating.');
      }
      toast.success('Your rating has been submitted!');
      fetchSet();
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit your rating.');
    }
  };

  const handleRemoveShare = async (userId: string) => {
    setIsRemoving(userId);
    try {
      const response = await fetch(`/api/sets/${id}/share?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove share');

      // Update the local state
      setSet(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sharedWith: prev.sharedWith.filter(share => share.sharedWith.id !== userId),
        };
      });

      toast.success('User removed from shared list');
      fetchSet();
    } catch (error) {
      console.error('Error removing share:', error);
      toast.error('Failed to remove user from shared list');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleDeleteSet = async () => {
    try {
      const response = await fetch(`/api/sets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete set');

      toast.success('Set deleted successfully');
      router.push('/sets');
    } catch (error) {
      console.error('Error deleting set:', error);
      toast.error('Failed to delete set');
    }
  };

  if (isLoading) {
    return <SetPageLoading />;
  }

  if (!set) {
    return <div className="p-8">No set here.</div>;
  }

  const currentFlashcard = set.flashcards[currentIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 lg:sticky top-8 self-start">
          <LibrarySidebar key={sidebarKey} />
        </aside>

        <main className="lg:col-span-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/sets')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sets
          </Button>

          <div className="space-y-6 mt-4">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-grow space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight mb-2">{set.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <StarRating
                      rating={set.rating.userRating}
                      onRate={handleRate}
                      size={18}
                    />
                    <span>/</span>
                    <span>
                      {set.rating.average.toFixed(1)} average from {set.rating.count} ratings
                    </span>
                  </div>
                  {set.description && (
                    <p className="text-muted-foreground">{set.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm border">
                      {set.public ? (
                        <>
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="text-primary font-medium">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground font-medium">Private</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" asChild>
                <Link href={`/sets/${id}/study`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Study
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/sets/${id}/test`}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Test
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/sets/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Set
                </Link>
              </Button>
              <ShareSetDialog setId={id} title={set.title} onShare={() => {
                toast.success('Set shared successfully')
                fetchSet();
              }} />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStudyingClick}
                disabled={isSubmitting}
              >
                <Bookmark className={cn('h-5 w-5', { 'fill-primary text-primary': isStudying })} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDeleteSet}>
                <Trash className="h-4 w-4" />
              </Button>
              {/* @todo: these buttons shouldn't be showing for all users (CRUD) */}
            </div>

            {set.sharedWith.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Shared With</h3>
                  </div>
                  <div className="space-y-2">
                    {set.sharedWith.map((share) => (
                      <div key={share.sharedWith.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {share.sharedWith.name || share.sharedWith.email}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveShare(share.sharedWith.id)}
                          disabled={isRemoving === share.sharedWith.id}
                        >
                          {isRemoving === share.sharedWith.id ? (
                            <Loading variant="inline" className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card
              className="cursor-pointer transition-all duration-500 hover:shadow-lg"
              onClick={() => setStudyMode(prev => prev === 'term' ? 'definition' : 'term')}
              style={{
                transform: studyMode === 'term' ? 'rotateY(0deg)' : 'rotateY(180deg)',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.5s',
              }}
            >
              <CardContent className="pt-6">
                {
                  set.flashcards.length > 0 ? (
                    <div className="min-h-[300px] flex items-center justify-center text-2xl text-center">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full text-center" style={{
                          transform: studyMode === 'term' ? 'rotateY(0deg)' : 'rotateY(180deg)',
                          transformStyle: 'preserve-3d',
                          transition: 'transform 0.5s',
                        }}>
                          {studyMode === 'term' ? currentFlashcard.term : currentFlashcard.definition}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No flashcards in this set yet.
                    </div>
                  )
                }
              </CardContent>
            </Card>

            {set.flashcards.length > 0 && (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
                    setStudyMode('term');
                  }}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="text-muted-foreground">
                  {currentIndex + 1} of {set.flashcards.length}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentIndex(prev => (prev < set.flashcards.length - 1 ? prev + 1 : prev));
                    setStudyMode('term');
                  }}
                  disabled={currentIndex === set.flashcards.length - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 