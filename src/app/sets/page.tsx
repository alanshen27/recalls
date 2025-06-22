'use client';

import { useState, useEffect } from 'react';
import { FlashcardSet, User } from '@prisma/client';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarNav } from '@/components/sidebar-nav';
import { FlashcardSetCard } from '@/components/flashcard-set-card';
import { FlashcardSetCardGridLoading } from '@/components/flashcard-set-card-grid-loading';

interface SetWithLabels extends Omit<FlashcardSet, 'labels'> {
  labels: string | null;
  flashcards: { id: string }[];
  owner?: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  isStudying: boolean;
  rating: {
    average: number;
    count: number;
    userRating: number;
  };
  sharedWith: {
    sharedWith: User;
  }[];
}

interface TrendingTag {
  tag: string;
  count: number;
}

export default function SetsPage() {
  const [sets, setSets] = useState<SetWithLabels[]>([]);
  const [studyingSets, setStudyingSets] = useState<SetWithLabels[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    all: false,
    mine: false,
    shared: false,
  });
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'shared'>('all');

  useEffect(() => {
    const fetchSets = async () => {
      setLoadingStates(prev => ({ ...prev, all: false, mine: false, shared: false, [activeTab]: true }));
      
      try {
        const response = await fetch(`/api/sets?type=${activeTab}`);
        if (!response.ok) throw new Error('Failed to fetch sets');
        const data = await response.json();
        
        setSets(data.sets || []);
        setStudyingSets(data.studying || []);

      } catch (error) {
        console.error('Error fetching sets:', error);
        setSets([]);
        setStudyingSets([]);
      } finally {
        setLoadingStates(prev => ({ ...prev, [activeTab]: false }));
      }
    };

    fetchSets();
  }, [activeTab]);

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const response = await fetch('/api/tags/trending');
        if (!response.ok) throw new Error('Failed to fetch trending tags');
        const data = await response.json();
        setTrendingTags(data);
      } catch (error) {
        console.error('Error fetching trending tags:', error);
      }
    };

    fetchTrendingTags();
  }, []);

  const handleStudyingChange = async (setId: string, isStudying: boolean) => {
    // Optimistically update the main sets list first
    const updateSetIsStudying = (prevSets: SetWithLabels[]) =>
      prevSets.map(s => (s.id === setId ? { ...s, isStudying } : s));

    setSets(updateSetIsStudying);
    setStudyingSets(updateSetIsStudying);

    if (isStudying) {
      // If adding a set, make sure we have its data in the studying list
      const setAlreadyInStudying = studyingSets.some(s => s.id === setId);
      if (!setAlreadyInStudying) {
        // Find it in the main sets list first
        let setToAdd = sets.find(s => s.id === setId);
        
        // If not found, it might be a public card from another user, so fetch it
        if (!setToAdd) {
          try {
            const response = await fetch(`/api/sets/${setId}`);
            if (response.ok) {
              const fetchedSet = await response.json();
              setToAdd = { ...fetchedSet, isStudying: true };
            }
          } catch (error) {
            console.error("Failed to fetch set details:", error);
          }
        }
        
        if (setToAdd) {
          setStudyingSets(prev => [...prev, setToAdd as SetWithLabels]);
        }
      }
    } else {
      // If removing, just filter it out from the studying list
      setStudyingSets(prev => prev.filter(s => s.id !== setId));
    }
  };

  const handleTrendingTagClick = (tag: string) => {
    if (!filterLabels.includes(tag)) {
      setFilterLabels([...filterLabels, tag]);
    } else {
      setFilterLabels(filterLabels.filter(l => l !== tag));
    }
  };

  const applyFilters = (setsToFilter: SetWithLabels[]) => {
    if (!setsToFilter) return [];
    return setsToFilter.filter(set => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        set.title.toLowerCase().includes(searchLower) ||
        (set.description && set.description.toLowerCase().includes(searchLower)) ||
        (set.labels && set.labels.toLowerCase().includes(searchLower));

      const matchesLabels = filterLabels.length === 0 || 
        filterLabels.some(label => set.labels?.toLowerCase().includes(label.toLowerCase()));

      return matchesSearch && matchesLabels;
    });
  }

  const filteredSets = applyFilters(sets);
  const filteredStudyingSets = applyFilters(studyingSets);

  const isLoading = loadingStates[activeTab];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Flashcard Sets</h1>

      <Tabs defaultValue="all" className="mb-8" onValueChange={(value) => setActiveTab(value as 'all' | 'mine' | 'shared')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mine">My Library</TabsTrigger>
          <TabsTrigger value="shared">Shared With Me</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <SidebarNav
            trendingTags={trendingTags}
            filterLabels={filterLabels}
            handleTrendingTagClick={handleTrendingTagClick}
          />
        </aside>

        <main className="lg:col-span-3">
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 px-3 border rounded-md bg-background">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search sets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                />
              </div>
            </div>
            <div className="flex-2">
              <TagInput
                tags={filterLabels}
                onChange={setFilterLabels}
                placeholder="Filter by labels..."
              />
            </div>
          </div>

          <div className="relative">
            {isLoading ? (
              <FlashcardSetCardGridLoading />
            ) : (
              <>
                {activeTab === 'mine' && (
                  <>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">My Sets</h2>
                    {filteredSets.length === 0 && (
                      <p className="text-muted-foreground mb-6">You haven&apos;t created any sets yet.</p>
                    )}
                  </>
                )}

                {filteredSets.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSets.map((set) => (
                      <FlashcardSetCard 
                        key={set.id} 
                        set={set}
                        onStudyingChange={handleStudyingChange}
                      />
                    ))}
                  </div>
                )}
                
                {activeTab === 'mine' && (
                  <>
                    <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">Studying</h2>
                    {filteredStudyingSets.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredStudyingSets.map((set) => (
                          <FlashcardSetCard 
                            key={set.id} 
                            set={set}
                            onStudyingChange={handleStudyingChange}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Sets you are studying will appear here.</p>
                    )}
                  </>
                )}

                {activeTab !== 'mine' && filteredSets.length === 0 && (
                  <p className="text-muted-foreground flex justify-center">No flashcard sets found.</p>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 