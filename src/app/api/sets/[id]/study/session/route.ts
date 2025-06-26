import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { studyOptions } = await request.json();
    const setId = (await params).id;

    // Verify the set exists and user has access
    const flashcardSet = await prisma.flashcardSet.findFirst({
      where: {
        id: setId,
        OR: [
          { ownerId: session.user.id },
          { public: true },
          {
            sharedWith: {
              some: {
                sharedWithId: session.user.id
              }
            }
          }
        ]
      }
    });

    if (!flashcardSet) {
      return NextResponse.json(
        { error: "Set not found or access denied" },
        { status: 404 }
      );
    }

    // Create study session
    const studySession = await prisma.studySession.create({
      data: {
        userId: session.user.id,
        flashcardSetId: setId,
        startedAt: new Date(),
        studyOptions: studyOptions,
      },
    });

    return NextResponse.json({
      id: studySession.id,
    });
  } catch (error) {
    console.error('Error creating study session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 