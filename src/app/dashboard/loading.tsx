import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LibrarySidebar } from "@/components/library-sidebar";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 lg:sticky top-8 self-start">
          <LibrarySidebar />
        </aside>
        <main className="lg:col-span-3 space-y-8">
          {/* Welcome Banner Skeleton */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 bg-white/20" />
                <Skeleton className="h-6 w-80 bg-white/20" />
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center space-y-1">
                  <Skeleton className="h-8 w-12 bg-white/20" />
                  <Skeleton className="h-4 w-16 bg-white/20" />
                </div>
                <div className="text-center space-y-1">
                  <Skeleton className="h-8 w-12 bg-white/20" />
                  <Skeleton className="h-4 w-20 bg-white/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Get Started Card Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
                <Skeleton className="h-10 w-32 mx-auto" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-12 ml-auto" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>

            {/* Streak Display Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-20 mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Chart Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center space-y-2">
                    <Skeleton 
                      className="w-full rounded-t"
                      style={{ 
                        height: `100px`,
                      }}
                    />
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}