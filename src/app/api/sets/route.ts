import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FlashcardSet } from "@prisma/client";

async function getSets(
  type: 'all' | 'mine' | 'shared' | 'studying',
  userId?: string
) {
  let sets: FlashcardSet[] = [];

  if (type === 'all') {
    sets = await prisma.flashcardSet.findMany({
      where: { public: true },
      include: {
        flashcards: true,
        owner: { select: { name: true, email: true, image: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  } else if (userId) {
    if (type === 'mine') {
      sets = await prisma.flashcardSet.findMany({
        where: { ownerId: userId },
        include: {
          flashcards: true,
          owner: { select: { name: true, email: true, image: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else if (type === 'shared') {
      const sharedSets = await prisma.sharedSet.findMany({
        where: { sharedWithId: userId },
        include: {
          flashcardSet: {
            include: {
              flashcards: true,
              owner: { select: { name: true, email: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      sets = sharedSets.map((s) => s.flashcardSet);
    } else if (type === 'studying') {
      const studyingSets = await prisma.studyingSet.findMany({
        where: { userId: userId },
        include: {
          flashcardSet: {
            include: {
              flashcards: true,
              owner: { select: { name: true, email: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      sets = studyingSets.map((s) => s.flashcardSet);
    }
  }

  const setIds = sets.map(s => s.id);
  const ratings = await prisma.rating.groupBy({
    by: ['flashcardSetId'],
    where: {
      flashcardSetId: {
        in: setIds,
      },
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  const ratingsMap = new Map(ratings.map(r => [r.flashcardSetId, {
    average: r._avg.rating,
    count: r._count.rating,
  }]));

  const setsWithRatings = sets.map(set => ({
    ...set,
    rating: ratingsMap.get(set.id) || { average: 0, count: 0 },
  }));

  if (!userId) {
    return { sets: setsWithRatings.map(set => ({ ...set, isStudying: false })) };
  }

  const studyingSetIds = (
    await prisma.studyingSet.findMany({
      where: { userId },
      select: { flashcardSetId: true },
    })
  ).map((s) => s.flashcardSetId);

  const processedSets = setsWithRatings.map((set) => ({
    ...set,
    isStudying: studyingSetIds.includes(set.id),
  }));

  if (type === 'mine') {
    const studyingSets = await prisma.studyingSet.findMany({
      where: { 
        userId: userId,
        // Exclude sets owned by the user
        flashcardSet: {
          ownerId: {
            not: userId,
          },
        },
      },
      include: {
        flashcardSet: {
          include: {
            flashcards: true,
            owner: { select: { name: true, email: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const studyingFlashcardSets = studyingSets.map((s) => ({
      ...s.flashcardSet,
      isStudying: true,
    }));

    return {
      sets: processedSets,
      studying: studyingFlashcardSets,
    };
  }

  return { sets: processedSets };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = (url.searchParams.get("type") || "all") as 'all' | 'mine' | 'shared' | 'studying';

    if (type === 'all') {
      const data = await getSets('all');
      return NextResponse.json(data);
    }
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // For 'mine', 'shared', 'studying', user must be logged in.
      // We can return a 401 or an empty array.
      // Let's return empty arrays to avoid errors on the frontend for now.
      if (type === 'mine') {
        return NextResponse.json({ sets: [], studying: [] });
      }
      return NextResponse.json({ sets: [] });
    }

    const data = await getSets(type, session.user.id);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in GET /api/sets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, description, labels, public: isPublic } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const set = await prisma.flashcardSet.create({
      data: {
        title,
        description: description || null,
        labels: labels || null,
        public: isPublic || false,
        ownerId: session.user.id,
      },
      include: {
        flashcards: true,
        owner: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(set);
  } catch (error) {
    console.error('Error in POST /api/sets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 