import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { LibrarySidebar } from '@/components/library-sidebar';

export function SetPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 lg:sticky top-8 self-start">
          <LibrarySidebar />
        </aside>

        <main className="lg:col-span-3">
          {/* Back Button */}
          <Button variant="ghost" className="mb-8" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sets
          </Button>

          <div className="space-y-8">
            {/* Set Header */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  {/* Title */}
                  <Skeleton className="h-9 w-3/4 mb-2" />
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Skeleton className="h-4 w-20" />
                    <span>/</span>
                    <Skeleton className="h-4 w-32" />
                  </div>
                  
                  {/* Description */}
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-10" />
            </div>

            {/* Shared With Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Flashcard Preview Card */}
            <Card className="cursor-pointer transition-all duration-500 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="min-h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 