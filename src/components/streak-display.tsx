'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar, Award, BookOpen, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Achievement,achievements } from "@/utils/achievements";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak?: number;
  className?: string;
  gottenAchievements: Achievement[];
  }

export function StreakDisplay({ 
  currentStreak, 
  longestStreak, 
  className,
  gottenAchievements
}: StreakDisplayProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-red-500 dark:text-red-400";
    if (streak >= 3) return "text-orange-500 dark:text-orange-400";
    return "text-yellow-500 dark:text-yellow-400";
  };

  const getStreakBackground = (streak: number) => {
    if (streak >= 7) return "bg-red-100 dark:bg-red-950/30";
    if (streak >= 3) return "bg-orange-100 dark:bg-orange-950/30";
    return "bg-yellow-100 dark:bg-yellow-950/30";
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your learning streak today!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak < 7) return "You're building momentum!";
    if (streak < 30) return "Amazing consistency!";
    return "Incredible dedication!";
  };

  const getIconComponent = (icon: string, color: string) => {
    const className = cn("h-3 w-3", {
      'text-green-600 dark:text-green-400': color === 'green',
      'text-orange-600 dark:text-orange-400': color === 'orange',
      'text-red-600 dark:text-red-400': color === 'red',
      'text-purple-600 dark:text-purple-400': color === 'purple',
      'text-blue-600 dark:text-blue-400': color === 'blue',
      'text-yellow-600 dark:text-yellow-400': color === 'yellow',
      'text-gray-400 dark:text-gray-500': color === 'gray',
    })

    switch (icon) {
      case "BookOpen": return <BookOpen className={className} />;
      case "Flame": return <Flame className={className} />;
      case "Target": return <Target className={className} />;
      case "Star": return <Star className={className} />;
    }
  }

  const unlockedAchievements = gottenAchievements;
  const lockedAchievements = achievements.filter(a => !gottenAchievements.some(ga => ga.id === a.id)).slice(0, 3);

  return (
    <Card className={cn("bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800", className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Streak Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", getStreakBackground(currentStreak))}>
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
                return (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
                    <div className={cn("p-1.5 rounded-full", {
                      'bg-green-100 dark:bg-green-950/50': achievement.color === 'green',
                      'bg-orange-100 dark:bg-orange-950/50': achievement.color === 'orange',
                      'bg-red-100 dark:bg-red-950/50': achievement.color === 'red',
                      'bg-purple-100 dark:bg-purple-950/50': achievement.color === 'purple',
                      'bg-blue-100 dark:bg-blue-950/50': achievement.color === 'blue',
                      'bg-yellow-100 dark:bg-yellow-950/50': achievement.color === 'yellow',
                    })}>
                      {getIconComponent(achievement.icon, achievement.color)}
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
                return (
                  <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/20 dark:border-gray-700/20 opacity-60">
                    <div className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                      {getIconComponent(achievement.icon, "gray")}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{achievement.title}</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{achievement.description}</p>
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