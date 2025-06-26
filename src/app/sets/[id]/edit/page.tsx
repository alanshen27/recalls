'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import EditFlashcards from './EditFlashcards';
import { Set } from '@/lib/types';
import { Loading } from "@/components/ui/loading";

export default function EditSetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [set, setSet] = useState<Set | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = use(params);


  const fetchSet = async () => {
    try {
      const response = await fetch(`/api/sets/${id}`);
      if (!response.ok) throw new Error('Failed to fetch set');
      const data = await response.json();
      setSet(data);
    } catch (error) {
      console.error('Error fetching set:', error);
      toast.error('Failed to fetch set data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSet();
  }, [id]);

  const updateSet = (field: 'title' | 'description' | 'public', value: string | boolean) => {
    if (!set) return;
    setSet({ ...set, [field]: value });
  };

  const saveSet = async () => {
    if (!set) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: set.title,
          description: set.description,
          public: set.public
        }),
      });

      if (!response.ok) throw new Error('Failed to save set');

      toast.success('Set saved successfully');
      router.push(`/sets/${id}`);
    } catch (error) {
      console.error('Error saving set:', error);
      toast.error('Failed to save set');
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return <Loading />;
  }

  if (!set) {
    return <div>Set not found</div>;
  }

  return (
    <div className="container w-full py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push(`/sets/${id}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to set
      </Button>

      <div className="space-y-6 flex flex-col lg:flex-row lg:space-y-0 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Set</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={set.title}
                onChange={(e) => updateSet('title', e.target.value)}
                placeholder="Enter set title"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                value={set.description || ''}
                onChange={(e) => updateSet('description', e.target.value)}
                placeholder="Enter set description"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">
                Visibility
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id="public"
                    checked={set.public}
                    onCheckedChange={(checked) => updateSet('public', checked as boolean)}
                  />
                  <div className="flex items-center gap-3">
                    <Globe className="h-7 w-7 text-primary" />
                    <div>
                      <Label htmlFor="public" className="text-sm font-medium cursor-pointer">
                        Make this set public
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Anyone can discover and study this set. Great for sharing knowledge with the community.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="private"
                    checked={!set.public}
                    onCheckedChange={(checked) => updateSet('public', !checked)}
                    disabled
                  />
                  <div className="flex items-center gap-3">
                    <Lock className="h-7 w-7 text-muted-foreground" />
                    <div>
                      <Label htmlFor="private" className="text-sm font-medium text-muted-foreground cursor-pointer">
                        Keep this set private
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Only you can see and access this set. Perfect for personal study materials.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={saveSet}
              disabled={isSaving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Set'}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center gap-2">
              <span>Flashcards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">    
            <EditFlashcards
              setId={id}
              initialFlashcards={set.flashcards}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 