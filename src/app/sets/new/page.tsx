'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe, Lock } from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";

export default function NewSetPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description,
          labels: tags.join(','),
          public: isPublic
        }),
      });

      if (!response.ok) throw new Error('Failed to create set');

      const data = await response.json();
      router.push(`/sets/${data.id}/edit`);
    } catch (error) {
      console.error('Error creating set:', error);
      alert('Failed to create set. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-8"
        onClick={() => router.push('/sets')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sets
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Flashcard Set</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="Enter set title"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Enter set description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tags (optional)
              </label>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="Add tags (press Enter)"
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
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked as boolean)}
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
                    checked={!isPublic}
                    onCheckedChange={(checked) => setIsPublic(!checked)}
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

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating...' : 'Create Set'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 