import { prisma } from "@/lib/prisma";
import { Achievement, DashboardData } from "./achievements";
import { achievements } from "./achievements";

export async function checkForAchievements(dashboardData: DashboardData, userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            achievements: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const userAchievements = user.achievements as unknown as Achievement[];

    const notGottenAchievements = achievements.filter(achievement => !userAchievements.some(a => a.id === achievement.id));

    const newAchievements = notGottenAchievements.filter(achievement => achievement.trigger(dashboardData));

    await prisma.user.update({
        where: { id: userId },
        data: { achievements: [...userAchievements, ...newAchievements.map(a => ({
            id: a.id,
            title: a.title,
            description: a.description,
            icon: a.icon,
            color: a.color,
        }))] },
    });
}