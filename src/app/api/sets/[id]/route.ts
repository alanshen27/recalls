import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from "@/lib/auth";

export async function OPTIONS() {
  return new NextResponse(null, {
      status: 204,
      headers: {
          'Access-Control-Allow-Origin': process.env.NOTATE_URL || 'https://www.notate.sh',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
      },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      const set = await prisma.flashcardSet.findUnique({
        where: {
          id: id,
        },
        select: {
          flashcards: true,
          ownerId: true,
        }
      });

      if (!set) {
        return new NextResponse('Set not found', { status: 404 });
      }

      if (!set.ownerId) {
        const response = NextResponse.json(set);
        response.headers.set('Access-Control-Allow-Origin', process.env.NOTATE_URL || 'https://www.notate.sh');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
      }

      return NextResponse.json('Unauthorized', { status: 401 });
      
    }

    const set = await prisma.flashcardSet.findUnique({
      where: {
        id: id,
      },
      include: {
        flashcards: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        sharedWith: {
          include: {
            sharedWith: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!set) {
      return new NextResponse('Set not found', { status: 404 });
    }

    if(!set.ownerId) {
      return NextResponse.json(set, {
        headers: {
          'Access-Control-Allow-Origin': process.env.NOTATE_URL || 'https://www.notate.sh',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Check if user has access to this set
    const hasAccess = set.ownerId === session.user.id || 
      set.sharedWith.some((share: { sharedWithId: string }) => share.sharedWithId === session.user.id);

    if (!hasAccess && !set.public) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const studyingEntry = await prisma.studyingSet.findUnique({
      where: {
        flashcardSetId_userId: {
          flashcardSetId: id,
          userId: session.user.id,
        },
      },
    });

    const aggregateRating = await prisma.rating.aggregate({
      where: {
        flashcardSetId: id,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const userRating = await prisma.rating.findUnique({
      where: {
        flashcardSetId_userId: {
          flashcardSetId: id,
          userId: session.user.id,
        },
      },
      select: {
        rating: true,
      }
    })

    const responseData = {
      ...set,
      isStudying: !!studyingEntry,
      rating: {
        average: aggregateRating._avg.rating || 0,
        count: aggregateRating._count.rating,
        userRating: userRating?.rating || 0,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching set:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Check if user owns this set
    const existingSet = await prisma.flashcardSet.findUnique({
      where: { id: id },
      select: { ownerId: true }
    });

    if (!existingSet || existingSet.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const set = await prisma.flashcardSet.update({
      where: { id: id },
      data: {
        title,
        description: description || null,
        labels: labels || null,
        public: isPublic !== undefined ? isPublic : false,
      },
    });

    return NextResponse.json(set);
  } catch (error) {
    console.error('Error updating set:', error);
    return NextResponse.json(
      { error: 'Failed to update set' },
      { status: 500 }
    );
  }
} 

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const set = await prisma.flashcardSet.findUnique({
      where: { id: id },
    });

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    if (set.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.flashcardSet.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Set deleted successfully" });
  } catch (error) {
    console.error('Error deleting set:', error);
    return NextResponse.json({ error: "Failed to delete set" }, { status: 500 });
  }
}