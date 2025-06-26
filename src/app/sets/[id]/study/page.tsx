'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Flashcard } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { StudyModal } from '@/components/ui/study-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Loading } from "@/components/ui/loading";
import { toast } from 'sonner';

interface StudyCard {
  card: Flashcard;
  flashcardId: string;
  isMultipleChoice: boolean;
  testTerm: boolean;
  multipleChoiceOptions?: string[];
  userAnswer: string;
  isCorrect: boolean;
  isAnswered: boolean;
  attempts: number;
}

interface StudyOptions {
  count: number;
  mode: 'term' | 'definition' | 'both';
  shuffle: boolean;
  repeat: boolean;
  studyStyle: 'multipleChoice' | 'typed' | 'both';
}

type StudyState = 'modal' | 'studying' | 'completed';

export default function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  // Data state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Study state
  const [studyState, setStudyState] = useState<StudyState>('modal');
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studySessionId, setStudySessionId] = useState<string | null>(null);
  // Current card state
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Post single study result
  const postSingleResult = async (card: StudyCard, answer: string, isCorrect: boolean) => {
    if (!studySessionId) {
      console.error('No study session ID available');
      return;
    }

    try {
      await fetch(`/api/sets/${id}/study/session/${studySessionId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: card.flashcardId,
          userAnswer: answer,
          attempts: card.attempts + 1,
          correct: isCorrect ? 1 : 0,
          accuracy: isCorrect ? 100 : 0,
          isCorrect,
          testTerm: card.testTerm,
          isMultipleChoice: card.isMultipleChoice,
          selectedOption: card.isMultipleChoice ? answer : undefined,
        }),
      });
    } catch (error) {
      console.error('Error posting single study result:', error);
    }
  };

  // Fetch flashcards on mount
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch(`/api/sets/${id}/flashcards`);
        if (!response.ok) throw new Error('Failed to fetch flashcards');
        const data = await response.json();
        setFlashcards(data);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [id]);

  // Generate multiple choice options
  const generateMultipleChoiceOptions = (correctAnswer: string, allAnswers: string[]) => {
    const incorrectOptions = allAnswers
      .filter(answer => answer !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    return [...incorrectOptions, correctAnswer]
      .sort(() => Math.random() - 0.5);
  };

  // Start study session
  const handleStartStudy = async (count: number, options: StudyOptions) => {
    
    // Select and prepare cards - only include cards with both term and definition
    let selectedCards = flashcards.filter(card => card.term && card.definition);
    
    if (selectedCards.length === 0) {
      // No valid cards to study
      toast.error('No flashcards with both term and definition found. Please add complete flashcards to this set.');
      return;
    }
    
    if (options.shuffle) {
      selectedCards = selectedCards.sort(() => Math.random() - 0.5);
    }
    selectedCards = selectedCards.slice(0, count);
    
    // Create study session first
    try {
      const sessionResponse = await fetch(`/api/sets/${id}/study/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyOptions: options }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create study session');
      }

      const sessionData = await sessionResponse.json();
      setStudySessionId(sessionData.id);
    } catch (error) {
      console.error('Error creating study session:', error);
      toast.error('Failed to start study session. Please try again.');
      return;
    }
    
    // Create study cards
    const preparedCards: StudyCard[] = selectedCards.map(card => {
      const isMultipleChoice = 
        options.studyStyle === 'multipleChoice' ? true :
        options.studyStyle === 'typed' ? false :
        Math.random() < 0.5;

      // the thing you are testing for
      const testTerm = options.mode === 'both' 
        ? Math.random() < 0.5 // 0.0-0.4 true, 0.5-1.0 false
        : options.mode === 'term' ? true : false; // true = term, false = definition

      // If asking for term, correct answer is the term, choices are definitions
      // If asking for definition, correct answer is the definition, choices are terms
      const correctAnswer = testTerm ? card.definition! : card.term!; // true = term, false = definition
      
      // For multiple choice, we need to get all possible choices from other cards
      // When asking for term, choices should be terms from other cards
      // When asking for definition, choices should be definitions from other cards
      let multipleChoiceOptions: string[] | undefined;
      
      if (isMultipleChoice) {
        const allChoices = flashcards.map(otherCard => {
          if (testTerm) {
            return otherCard.definition!;
          }
          return otherCard.term!;
        }).filter(Boolean);

        multipleChoiceOptions = generateMultipleChoiceOptions(correctAnswer, allChoices);
      }
      
      return {
        card,
        flashcardId: card.id,
        isMultipleChoice,
        testTerm,
        multipleChoiceOptions,
        userAnswer: '',
        isCorrect: false,
        isAnswered: false,
        attempts: 0,
      };
    });

    console.log(preparedCards);
    
    setStudyCards(preparedCards);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setStudyState('studying');
  };

  // Submit answer for current card
  const submitAnswer = (answer: string) => {
    if (studyCards[currentIndex].isAnswered) return;

    const currentCard = studyCards[currentIndex];
    const normalizedUserAnswer = answer.trim().toLowerCase();
    
    // The correct answer is what the user should provide
    // If asking for term, correct answer is the term
    // If asking for definition, correct answer is the definition
    const correctAnswer = currentCard.testTerm
      ? currentCard.card.definition!.trim().toLowerCase()
      : currentCard.card.term!.trim().toLowerCase();
    
    const isCorrect = normalizedUserAnswer === correctAnswer;

    // Post result immediately
    postSingleResult(currentCard, answer, isCorrect);

    setStudyCards(prev => {
      const newCards = [...prev];
      newCards[currentIndex] = {
        ...newCards[currentIndex],
        userAnswer: answer,
        isCorrect,
        isAnswered: true,
        attempts: newCards[currentIndex].attempts + 1,
      };
      return newCards;
    });

    setCurrentAnswer(answer);
  };

  // Move to next card
  const nextCard = () => {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= studyCards.length) {
      // Study session complete
      completeStudySession();
      return;
    }

    setCurrentIndex(nextIndex);
    setCurrentAnswer('');
  };

  // Complete study session and save results
  const completeStudySession = async () => {
    // Mark study session as completed
    if (studySessionId) {
      try {
        await fetch(`/api/sets/${id}/study/session/${studySessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedAt: new Date().toISOString() }),
        });
      } catch (error) {
        console.error('Error completing study session:', error);
      }
    }

    // Results are already posted one by one, so we can just navigate to results
    const results = studyCards.map(card => ({
      flashcardId: card.flashcardId,
      userAnswer: card.userAnswer,
      attempts: card.attempts,
      correct: card.isCorrect ? 1 : 0,
      accuracy: card.isCorrect ? 100 : 0,
      isCorrect: card.isCorrect,
      testTerm: card.testTerm,
      isMultipleChoice: card.isMultipleChoice,
      selectedOption: card.isMultipleChoice ? card.userAnswer : undefined,
    }));

    // Navigate to results page
    router.push(`/sets/${id}/study/result?results=${encodeURIComponent(JSON.stringify(results))}`);
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const currentCard = studyCards[currentIndex];
      
      if (!currentCard.isAnswered && currentAnswer.trim()) {
        submitAnswer(currentAnswer);
      } else if (currentCard.isAnswered) {
        nextCard();
      }
    }
  };

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // No flashcards state
  if (flashcards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No flashcards found in this set.</p>
            <Button onClick={() => router.push(`/sets/${id}`)}>
              Back to Set
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if there are any valid cards for studying
  const validCards = flashcards.filter(card => card.term && card.definition);
  if (validCards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              No flashcards with both term and definition found. Please add complete flashcards to this set.
            </p>
            <Button onClick={() => router.push(`/sets/${id}`)}>
              Back to Set
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Study modal
  if (studyState === 'modal') {
    const validCards = flashcards.filter(card => card.term && card.definition);
    
    return (
      <StudyModal
        isOpen={true}
        onClose={() => router.push(`/sets/${id}`)}
        onStart={handleStartStudy}
        maxCards={validCards.length}
      />
    );
  }

  // Study session
  const currentCard = studyCards[currentIndex];
  const masteredCards = studyCards.filter(card => card.isCorrect).length;
  const progress = (masteredCards / studyCards.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Progress Header */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{masteredCards} of {studyCards.length} cards mastered</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {studyCards.length}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Question */}
              <div>
                <p className="text-lg font-medium">
                  {currentCard.testTerm 
                    ? currentCard.card.term 
                    : currentCard.card.definition}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentCard.testTerm 
                    ? 'Enter the definition' 
                    : 'Enter the term'}
                </p>
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                {currentCard.isMultipleChoice ? (
                  <MultipleChoiceOptions
                    options={currentCard.multipleChoiceOptions!}
                    selectedAnswer={currentAnswer}
                    correctAnswer={currentCard.testTerm 
                      ? currentCard.card.definition! 
                      : currentCard.card.term!}
                    isAnswered={currentCard.isAnswered}
                    onSelect={submitAnswer}
                  />
                ) : (
                  <TypedAnswer
                    value={currentAnswer}
                    onChange={setCurrentAnswer}
                    onKeyDown={handleKeyDown}
                    placeholder={currentCard.testTerm 
                      ? "Type the term..." 
                      : "Type the definition..."}
                    disabled={currentCard.isAnswered}
                  />
                )}

                {/* Feedback */}
                {currentCard.isAnswered && (
                  <AnswerFeedback
                    isCorrect={currentCard.isCorrect}
                    userAnswer={currentCard.userAnswer}
                    correctAnswer={currentCard.testTerm 
                      ? currentCard.card.definition! 
                      : currentCard.card.term!}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {!currentCard.isAnswered ? (
            <Button 
              onClick={() => submitAnswer(currentAnswer)}
              disabled={!currentAnswer.trim()}
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={nextCard}>
              {currentIndex === studyCards.length - 1 ? 'Finish' : 'Next Card'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Multiple Choice Component
function MultipleChoiceOptions({ 
  options, 
  selectedAnswer, 
  correctAnswer, 
  isAnswered, 
  onSelect 
}: {
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isAnswered: boolean;
  onSelect: (answer: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option;
        const isCorrectAnswer = option === correctAnswer;
        const showFeedback = isAnswered && (isSelected || isCorrectAnswer);
        
        let buttonClassName = "h-auto py-4 px-4 text-base whitespace-normal text-left";
        
        if (showFeedback) {
          if (isCorrectAnswer) {
            buttonClassName += " border-green-500 bg-green-100 text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950";
          } else if (isSelected) {
            buttonClassName += " border-red-500 bg-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950";
          }
        } else if (isSelected) {
          buttonClassName += " border-primary";
        }

        return (
          <Button
            key={index}
            variant="outline"
            onClick={() => !isAnswered && onSelect(option)}
            disabled={isAnswered}
            className={buttonClassName}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
}

// Typed Answer Component
function TypedAnswer({ 
  value, 
  onChange, 
  onKeyDown, 
  placeholder, 
  disabled 
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className="text-base"
    />
  );
}

// Answer Feedback Component
function AnswerFeedback({ 
  isCorrect, 
  correctAnswer 
}: {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}) {
  return (
    <div className={`p-4 rounded-md ${isCorrect ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
      <p className="font-medium mb-2">
        {isCorrect ? 'Correct!' : 'Incorrect'}
      </p>
      <p className="text-muted-foreground">
        Correct answer: {correctAnswer}
      </p>
    </div>
  );
} 