import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, StudySession } from "@prisma/client";

const getDuration = (session: StudySession) => {
    

  return session.completedAt ? session.completedAt.getTime() - session.createdAt.getTime() : 0;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's sets (owned and studying)
    const ownedSets = await prisma.flashcardSet.findMany({
      where: { ownerId: userId },
      include: {
        flashcards: true,
      },
    });

    const studyingSets = await prisma.studyingSet.findMany({
      where: { userId },
      include: {
        flashcardSet: {
          include: {
            flashcards: true,
          },
        },
      },
    });

    const allSets = [
      ...ownedSets,
      ...studyingSets.map(s => s.flashcardSet),
    ];

    // Calculate basic stats
    const totalSets = allSets.length;
    const totalFlashcards = allSets.reduce((sum, set) => sum + set.flashcards.length, 0);

    // Get study sessions from the past week
    const recentSessions = (await prisma.studySession.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        results: true,
      }
    })).map(session => {

      if (!session.completedAt && session.results.length > 0) {
        session.results.sort((a, b) => a.answeredAt.getTime() - b.answeredAt.getTime());
        session.completedAt = session.results[session.results.length - 1].answeredAt;
      }
      return session;
    });


    console.log(recentSessions)
    // Calculate stats


    
    const setsStudiedThisWeek = new Set(recentSessions.map(s => s.flashcardSetId)).size;
    const totalStudyTime = recentSessions.reduce((sum, session) => sum + getDuration(session), 0);
    const totalCardsStudied = recentSessions.reduce((sum, session) => sum + session.results.length, 0);
    const totalCorrectAnswers = recentSessions.reduce((sum, session) => sum + session.results.filter(r => r.isCorrect).length, 0);
    const averageRetentionRate = totalCardsStudied > 0 ? Math.round((totalCorrectAnswers / totalCardsStudied) * 100) : 0;

    // Calculate streak (mock data for now)
    const { currentStreak, longestStreak } = await calculateStreak(userId);

    // Get today's completed cards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = recentSessions
      .filter(session => session && session.completedAt && session.completedAt >= today)
      .reduce((sum, session) => sum + session.results.length, 0);

    // Get recent sets with progress
    const recentSets = allSets.slice(0, 5).map(set => {
      const setSessions = recentSessions.filter(s => s.flashcardSetId === set.id);
      const uniqueFlashcardIds = new Set();
      setSessions.forEach(session => {
        session.results.forEach(result => {
          uniqueFlashcardIds.add(result.flashcardId);
        });
      });
      const totalStudied = uniqueFlashcardIds.size;
      const progress = set.flashcards.length > 0 ? Math.round((totalStudied / set.flashcards.length) * 100) : 0;
      
      return {
        id: set.id,
        title: set.title,
        lastStudied: setSessions.length > 0 && setSessions[0].results.length > 0 ? 
          formatTimeAgo(setSessions[0].results[0].answeredAt) : 'Never',
        progress: Math.min(progress, 100),
        totalCards: set.flashcards.length,
        studiedCards: totalStudied,
      };
    });


    const dashboardData = {
      stats: {
        totalSets,
        setsStudiedThisWeek,
        totalStudyTime,
        averageRetentionRate,
        streakDays: currentStreak,
        totalFlashcards,
        completedToday,
        longestStreak,
      },
      recentSets,
      weeklyData: calculateWeeklyData(recentSessions),
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error in GET /api/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

function calculateWeeklyData(sessions: Prisma.StudySessionGetPayload<{
  include: {
    results: true;
  };
}>[]): { day: string; count: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = days.map(day => ({ day, count: 0 }));
  
  // Get the start of the current week (Monday)
  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0
  startOfWeek.setDate(now.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  
  sessions.forEach(session => {
    if (session.completedAt) {
      const sessionDate = new Date(session.completedAt);
      if (sessionDate >= startOfWeek) {
        const dayIndex = sessionDate.getDay();
        const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to Monday=0
        if (adjustedDayIndex >= 0 && adjustedDayIndex < 7) {
          weeklyData[adjustedDayIndex].count += session.results.length;
        }
      }
    }
  });
  
  return weeklyData;
}

async function calculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  try {
    // Get all study sessions for the user
    const allSessions = await prisma.studySession.findMany({
      where: { userId },
      select: {
        createdAt: true,
        completedAt: true,
        results: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (allSessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Get unique dates where user studied (using completedAt or last result time)
    const studyDates = new Set<string>();
    
    allSessions.forEach(session => {
      let studyDate: Date;
      
      if (session.completedAt) {
        studyDate = session.completedAt;
      } else if (session.results.length > 0) {
        // Sort results by answeredAt and use the latest one
        session.results.sort((a, b) => b.answeredAt.getTime() - a.answeredAt.getTime());
        studyDate = session.results[0].answeredAt;
      } else {
        studyDate = session.createdAt;
      }
      
      // Convert to date string (YYYY-MM-DD) to get unique dates
      const dateString = studyDate.toISOString().split('T')[0];
      studyDates.add(dateString);
    });

    // Convert to array and sort in descending order
    const sortedDates = Array.from(studyDates).sort((a, b) => b.localeCompare(a));
    
    if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = today;

    for (const date of sortedDates) {
      // If this date is consecutive to our current streak
      if (date === currentDate) {
        streak++;
        // Move to previous day
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        currentDate = prevDate.toISOString().split('T')[0];
      } else {
        // Break in streak, stop counting
        break;
      }
    }

    return { currentStreak: streak, longestStreak: streak };
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
} 