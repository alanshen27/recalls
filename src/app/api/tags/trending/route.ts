import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all flashcard sets with labels
    const sets = await prisma.flashcardSet.findMany({
      select: {
        labels: true,
      },
      where: {
        labels: {
          not: null,
        },
      },
    });

    // Extract and count all tags
    const tagCounts: { [key: string]: number } = {};
    
    sets.forEach(set => {
      if (set.labels) {
        const tags = set.labels.split(',').map(tag => tag.trim().toLowerCase());
        tags.forEach(tag => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });

    // Sort tags by count (descending) and take top 10
    const trendingTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({
        tag,
        count,
      }));

    return NextResponse.json(trendingTags);
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 