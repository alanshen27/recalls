'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LibrarySidebar } from '@/components/library-sidebar';
import { Loading } from "@/components/ui/loading";
import { FileUpload } from '@/components/file-upload';
import { StreakDisplay } from '@/components/streak-display';
import { 
  TrendingUp, 
  Clock, 
  FileText, 
  Upload,
  Calendar,
  Zap
} from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DashboardStats {
  totalSets: number;
  setsStudiedThisWeek: number;
  totalStudyTime: number;
  averageRetentionRate: number;
  streakDays: number;
  longestStreak?: number;
  totalFlashcards: number;
  completedToday: number;
}

interface RecentSet {
  id: string;
  title: string;
  lastStudied: string;
  progress: number;
  totalCards: number;
  studiedCards: number;
}

interface WeeklyData {
  day: string;
  count: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSets, setRecentSets] = useState<RecentSet[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        
        setStats(data.stats);
        setRecentSets(data.recentSets);
        setWeeklyData(data.weeklyData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error fetching dashboard data.')
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleFileUpload = async (flashcards: { term: string; definition: string }[]) => {
    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Imported Set - ${new Date().toLocaleDateString()}`,
          description: `Imported from file with ${flashcards.length} flashcards`,
          flashcards: flashcards,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create set');
      }

      const newSet = await response.json();
      toast.success('Flashcard set created successfully!');
      setShowFileUpload(false);
      router.push(`/sets/${newSet.id}`);
    } catch (error) {
      console.error('Error creating set:', error);
      toast.error('Failed to create flashcard set');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <LibrarySidebar />
          </aside>
          <main className="lg:col-span-3">
            <Loading />
          </main>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = (minutes % 60).toFixed(0);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 lg:sticky top-8 self-start">
          <LibrarySidebar />
        </aside>

        <main className="lg:col-span-3 space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {session?.user?.name || 'User'}! 👋
                </h1>
                <p className="text-orange-100 text-lg">
                  Ready to continue your learning journey?
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats?.streakDays}</div>
                  <div className="text-orange-100 text-sm">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats?.completedToday}</div>
                  <div className="text-orange-100 text-sm">Cards Today</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sets</p>
                    <p className="text-2xl font-bold">{stats?.totalSets}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Study Time</p>
                    <p className="text-2xl font-bold">{formatTime(stats?.totalStudyTime || 0)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                    <p className="text-2xl font-bold">{stats?.averageRetentionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">{stats?.setsStudiedThisWeek}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Upload Section - Show when no sets or as "Get Started" */}
          {stats?.totalSets === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Let's Get Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload onUpload={handleFileUpload} />
              </CardContent>
            </Card>
          )}

          {/* Show "Get Started" button if user has sets but wants to upload more */}
          {stats?.totalSets && stats.totalSets > 0 && !showFileUpload && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Want to add more content?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file to quickly create a new flashcard set
                  </p>
                  <Button onClick={() => setShowFileUpload(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recent Sets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 flex flex-col">
                  {recentSets.map((set) => (
                    <Link key={set.id} href={`/sets/${set.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium">{set.title}</h4>
                          <p className="text-sm text-muted-foreground">{set.lastStudied}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{set.studiedCards}/{set.totalCards}</div>
                          <Progress value={set.progress} className="w-20 h-2" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/sets">View All Sets</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Streak Display replaces Achievements */}
            <StreakDisplay 
              currentStreak={stats?.streakDays || 0} 
              longestStreak={stats?.longestStreak || 0}
              totalSets={stats?.totalSets || 0}
              totalStudyTime={stats?.totalStudyTime || 0}
              averageRetentionRate={stats?.averageRetentionRate || 0}
            />
          </div>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {weeklyData.map((dayData) => {
                  // Calculate height based on the maximum count in the week
                  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
                  const height = dayData.count > 0 ? (dayData.count / maxCount) * 80 + 20 : 20;
                  
                  return (
                    <div key={dayData.day} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-primary rounded-t transition-all duration-300"
                        style={{ 
                          height: `${height}px`,
                          minHeight: '20px'
                        }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">{dayData.day}</span>
                      <span className="text-xs text-muted-foreground mt-1">{dayData.count} cards</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 