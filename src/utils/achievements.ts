export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    trigger: (data: DashboardData) => boolean;
    color: string;
}

export interface DashboardData {
    stats: {
        totalSets: number;
        setsStudiedThisWeek: number;
        totalStudyTime: number;
        averageRetentionRate: number;
        streakDays: number;
        longestStreak: number;
    }
}

export const achievements: Achievement[] = [
    {
        id: 'first-set',
        title: 'First Set',
        description: 'Create your first flashcard set',
        icon: "BookOpen",
        trigger: (data: DashboardData) => data.stats.totalSets === 1,
        color: 'blue'
    },
    {
        id: 'streak-1',
        title: 'First Day',
        description: 'Complete your first day of studying',
        icon: "Flame",
        trigger: (data: DashboardData) => data.stats.streakDays >= 1,
        color: 'green'
    },
    {
        id: 'streak-3',
        title: '3-Day Streak',
        description: 'Study for 3 consecutive days',
        icon: "Flame",
        trigger: (data: DashboardData) => data.stats.streakDays >= 3,
        color: 'orange'
    },
    {
        id: 'streak-7',
        title: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        icon: "Flame",
        trigger: (data: DashboardData) => data.stats.streakDays >= 7,
        color: 'red'
    },
    {
        id: 'streak-30',
        title: 'Monthly Master',
        description: 'Study for 30 consecutive days',
        icon: "Flame",
        trigger: (data: DashboardData) => data.stats.streakDays >= 30,
        color: 'purple'
    },
    {
        id: 'sets-5',
        title: 'Set Collector',
        description: 'Create 5 flashcard sets',
        icon: "BookOpen",
        trigger: (data: DashboardData) => data.stats.totalSets >= 5,
        color: 'blue'
    },
    {
        id: 'sets-10',
        title: 'Set Master',
        description: 'Create 10 flashcard sets',
        icon: "BookOpen",
        trigger: (data: DashboardData) => data.stats.totalSets >= 10,
        color: 'blue'
    },
    {
        id: 'time-60',
        title: 'Hour Learner',
        description: 'Study for 1 hour total',
        icon: "Target",
        trigger: (data: DashboardData) => data.stats.totalStudyTime >= 60,
        color: 'green'
    },
    {
        id: 'time-300',
        title: 'Dedicated Student',
        description: 'Study for 5 hours total',
        icon: "Target",
        trigger: (data: DashboardData) => data.stats.totalStudyTime >= 300,
        color: 'orange'
    },
    {
        id: 'retention-80',
        title: 'High Retention',
        description: 'Achieve 80%+ retention rate',
        icon: "Star",
        trigger: (data: DashboardData) => data.stats.averageRetentionRate >= 80,
        color: 'yellow'
    },
    {
        id: 'retention-90',
        title: 'Memory Master',
        description: 'Achieve 90%+ retention rate',
        icon: "Star",
        trigger: (data: DashboardData) => data.stats.averageRetentionRate >= 90,
        color: 'yellow'
    }
];
