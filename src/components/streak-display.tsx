'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar, Award, BookOpen, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak?: number;
  className?: string;
  totalSets?: number;
  totalStudyTime?: number;
  averageRetentionRate?: number;
}

export function StreakDisplay({ 
  currentStreak, 
  longestStreak, 
  className,
  totalSets = 0,
  totalStudyTime = 0,
  averageRetentionRate = 0
}: StreakDisplayProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-red-500";
    if (streak >= 3) return "text-orange-500";
    return "text-yellow-500";
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your learning streak today!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak < 7) return "You're building momentum!";
    if (streak < 30) return "Amazing consistency!";
    return "Incredible dedication!";
  };

  // Calculate achievements
  const achievements = [
    {
      id: 'streak-1',
      title: 'First Day',
      description: 'Complete your first day of studying',
      icon: Flame,
      unlocked: currentStreak >= 1,
      color: 'green'
    },
    {
      id: 'streak-3',
      title: '3-Day Streak',
      description: 'Study for 3 consecutive days',
      icon: Flame,
      unlocked: currentStreak >= 3,
      color: 'orange'
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: Flame,
      unlocked: currentStreak >= 7,
      color: 'red'
    },
    {
      id: 'streak-30',
      title: 'Monthly Master',
      description: 'Study for 30 consecutive days',
      icon: Flame,
      unlocked: currentStreak >= 30,
      color: 'purple'
    },
    {
      id: 'sets-5',
      title: 'Set Collector',
      description: 'Create 5 flashcard sets',
      icon: BookOpen,
      unlocked: totalSets >= 5,
      color: 'blue'
    },
    {
      id: 'sets-10',
      title: 'Set Master',
      description: 'Create 10 flashcard sets',
      icon: BookOpen,
      unlocked: totalSets >= 10,
      color: 'blue'
    },
    {
      id: 'time-60',
      title: 'Hour Learner',
      description: 'Study for 1 hour total',
      icon: Target,
      unlocked: totalStudyTime >= 60,
      color: 'green'
    },
    {
      id: 'time-300',
      title: 'Dedicated Student',
      description: 'Study for 5 hours total',
      icon: Target,
      unlocked: totalStudyTime >= 300,
      color: 'orange'
    },
    {
      id: 'retention-80',
      title: 'High Retention',
      description: 'Achieve 80%+ retention rate',
      icon: Star,
      unlocked: averageRetentionRate >= 80,
      color: 'yellow'
    },
    {
      id: 'retention-90',
      title: 'Memory Master',
      description: 'Achieve 90%+ retention rate',
      icon: Star,
      unlocked: averageRetentionRate >= 90,
      color: 'yellow'
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked).slice(0, 3);

  return (
    <Card className={cn("bg-gradient-to-r from-orange-50 to-red-50 border-orange-200", className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Streak Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", getStreakColor(currentStreak).replace('text-', 'bg-').replace('-500', '-100'))}>
                <Flame className={cn("h-6 w-6", getStreakColor(currentStreak))} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{currentStreak}</span>
                  <span className="text-sm text-muted-foreground">day{currentStreak !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-sm text-muted-foreground">{getStreakMessage(currentStreak)}</p>
              </div>
            </div>
            
            {longestStreak && longestStreak > currentStreak && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Best: {longestStreak}</span>
                </div>
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achievements ({unlockedAchievements.length}/{achievements.length})
            </h3>
            
            <div className="space-y-2">
              {/* Unlocked Achievements */}
              {unlockedAchievements.slice(0, 3).map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/50 border border-white/20">
                    <div className={cn("p-1.5 rounded-full", {
                      'bg-green-100': achievement.color === 'green',
                      'bg-orange-100': achievement.color === 'orange',
                      'bg-red-100': achievement.color === 'red',
                      'bg-purple-100': achievement.color === 'purple',
                      'bg-blue-100': achievement.color === 'blue',
                      'bg-yellow-100': achievement.color === 'yellow',
                    })}>
                      <Icon className={cn("h-3 w-3", {
                        'text-green-600': achievement.color === 'green',
                        'text-orange-600': achievement.color === 'orange',
                        'text-red-600': achievement.color === 'red',
                        'text-purple-600': achievement.color === 'purple',
                        'text-blue-600': achievement.color === 'blue',
                        'text-yellow-600': achievement.color === 'yellow',
                      })} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}

              {/* Locked Achievements */}
              {lockedAchievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-100/50 border border-gray-200/20 opacity-60">
                    <div className="p-1.5 rounded-full bg-gray-200">
                      <Icon className="h-3 w-3 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-500">{achievement.title}</h4>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}

              {unlockedAchievements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Start studying to unlock achievements!
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 