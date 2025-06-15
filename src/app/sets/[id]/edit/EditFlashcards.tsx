'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Lock } from 'lucide-react';
import { emitFlashcardCreate, emitFlashcardDelete, emitFlashcardLock, emitFlashcardUnlock, emitFlashcardUpdate, getSocket } from '@/lib/socket';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface Flashcard {
  id: string;
  term: string | null;
  definition: string | null;
}

interface EditFlashcardsProps {
  setId: string;
  initialFlashcards: Flashcard[];
}

export default function EditFlashcards({ setId, initialFlashcards }: EditFlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [lastState, setLastState] = useState<Flashcard[]>(initialFlashcards);

  const [lockedFlashcards, setLockedFlashcards] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const debouncedFlashcards = useDebounce(flashcards, 1000);

  useEffect(() => {
      const socket = getSocket();
  
      socket.on('flashcard:updated', (data: {
        flashcard: Flashcard;
      }) => {
        console.log('Received flashcard update:', data.flashcard);
        console.log('Flashcards:', flashcards);
        console.log('found in flashcards:', flashcards.find((f) => f.id === data.flashcard.id))
        setFlashcards(prev => prev.map((f) => f.id === data.flashcard.id ? data.flashcard : f))
      });
  
      socket.on('flashcard:deleted', (data: { flashcardId: string }) => {
        console.log('Received flashcard delete:', data.flashcardId);
        setFlashcards(prev => prev.filter((f) => f.id !== data.flashcardId))
      });

      socket.on('flashcard:created', (data: { flashcard: Flashcard }) => {
        console.log('Received flashcard create:', data.flashcard);

        setFlashcards(prev => [...prev, {
          ...data.flashcard
        }])
      });

      socket.on('flashcard:locked', (data: { flashcardId: string }) => {
        setLockedFlashcards(prev => [...prev, data.flashcardId])
      });

      socket.on('flashcard:unlocked', (data: { flashcardId: string }) => {
        setLockedFlashcards(prev => prev.filter((id) => id !== data.flashcardId))
      });

      return () => {
        socket.off('flashcard:updated')
        socket.off('flashcard:created')
        socket.off('flashcard:deleted')
        socket.off('flashcard:locked')
        socket.off('flashcard:unlocked')
      }
  }, [])

  // Auto-save when debouncedFlashcards changes
  useEffect(() => {
    // Don't auto-save on initial mount
    if (debouncedFlashcards === initialFlashcards) return;
    saveFlashcards(debouncedFlashcards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFlashcards]);

  const saveFlashcards = async (cards: Flashcard[]) => {
    if (isSaved) return;
    setIsSaving(true);
    
    // Store the current state before saving
    const preSaveState = [...cards];
    
    try {
      const response = await fetch(`/api/sets/${setId}/flashcards`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cards),
      });

      if (!response.ok) throw new Error('Failed to save flashcards');

      // Only handle ID updates for new cards
      const hasNewCards = cards.some(card => card.id.startsWith('temp_'));
      
      if (hasNewCards) {
        const updatedResponse = await fetch(`/api/sets/${setId}/flashcards`);
        if (!updatedResponse.ok) throw new Error('Failed to fetch updated flashcards');
        const updatedFlashcards = await updatedResponse.json();

        // Only update IDs, preserve current content
        setFlashcards(prev => {
          return prev.map(card => {
            if (card.id.startsWith('temp_')) {
              const updated = updatedFlashcards.find(
                (u: Flashcard) => u.term === card.term && u.definition === card.definition
              );
              if (updated) {
                // Only update the ID, keep the current content
                return { ...card, id: updated.id };
              }
            }
            return card;
          });
        });

        // Emit events for new cards
        updatedFlashcards.forEach((flashcard: Flashcard) => {
          const currentFlashcard = lastState.find(f => f.id === flashcard.id);
          if (!currentFlashcard) {
            emitFlashcardCreate(flashcard, 'system');
          }
        });
      } else {
        // For existing cards, only emit updates for changed cards
        cards.forEach((flashcard: Flashcard) => {
          const currentFlashcard = lastState.find(f => f.id === flashcard.id);
          if (currentFlashcard && (
            flashcard.term !== currentFlashcard.term ||
            flashcard.definition !== currentFlashcard.definition
          )) {
            emitFlashcardUpdate(flashcard, 'system');
          }
        });
      }

      setLastState(preSaveState);
      toast.success('Flashcards saved successfully');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      toast.error('Failed to save flashcards');
    } finally {
      setIsSaving(false);
      setIsSaved(true);
    }
  };

  const addFlashcard = () => {
    setIsSaved(false);
    // Add a temporary flashcard with a unique ID
    const tempId = `temp_${Date.now()}`;
    const newFlashcard = { id: tempId, term: '', definition: '' };
    setFlashcards(prev => [...prev, newFlashcard]);
  };

  const removeFlashcard = (index: number) => {
    setIsSaved(false);
    const flashcard = flashcards[index];
    console.log('Removing flashcard:', flashcard);
    if (flashcard.id) {
      emitFlashcardDelete(flashcard.id, 'system');
    }
    const newFlashcards = [...flashcards];
    newFlashcards.splice(index, 1);
    setFlashcards(newFlashcards);
    toast.success('Flashcard deleted successfully');
  };

  const updateFlashcard = (index: number, field: 'term' | 'definition', value: string) => {
    setIsSaved(false);
    const newFlashcards = [...flashcards];
    newFlashcards[index] = { ...newFlashcards[index], [field]: value };
    setFlashcards(newFlashcards);
  };

  return (
    <div className="space-y-4">
      {flashcards.map((flashcard, index) => (
        <Card key={index}>
        <CardContent
          className={`p-4 space-y-4 relative border rounded-md transition-all duration-150
            ${lockedFlashcards.includes(flashcard.id)
              ? 'border-red-500 opacity-50'
              : 'border-transparent opacity-100'}`}
        >
          <div className="relative">
            {lockedFlashcards.includes(flashcard.id) && (
              <div className="absolute -top-2 -right-2 z-10">
                <Badge variant="outline" className="flex flex-row items-center gap-2 bg-background" >
                  <Lock className="h-4 w-4" />
                  Another user is editing..
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                value={flashcard.term || ''}
                onChange={(e) => updateFlashcard(index, 'term', e.target.value)}
                placeholder="Term"
                className="flex-1"
                onFocus={() => emitFlashcardLock(flashcard.id, 'system')}
                onBlur={() => emitFlashcardUnlock(flashcard.id, 'system')}
                disabled={lockedFlashcards.includes(flashcard.id)}
              />
              <Input
                value={flashcard.definition || ''}
                onChange={(e) => updateFlashcard(index, 'definition', e.target.value)}
                placeholder="Definition"
                className="flex-1"
                onFocus={() => emitFlashcardLock(flashcard.id, 'system')}
                onBlur={() => emitFlashcardUnlock(flashcard.id, 'system')}
                disabled={lockedFlashcards.includes(flashcard.id)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFlashcard(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      ))}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={addFlashcard}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Flashcard
        </Button>

        <Button
          onClick={() => saveFlashcards(flashcards)}
          disabled={isSaving || isSaved}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 