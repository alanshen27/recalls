import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resultData = await request.json();
    const { sessionId } = params;

    // Verify the study session exists and belongs to the user
    const studySession = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    });

    if (!studySession) {
      return NextResponse.json(
        { error: "Study session not found or access denied" },
        { status: 404 }
      );
    }

    // Add result to the study session
    const studyResult = await prisma.studyResult.create({
      data: {
        studySessionId: sessionId,
        flashcardId: resultData.flashcardId,
        userAnswer: resultData.userAnswer,
        attempts: resultData.attempts,
        isCorrect: resultData.isCorrect,
        testTerm: resultData.testTerm,
        isMultipleChoice: resultData.isMultipleChoice,
        selectedOption: resultData.selectedOption,
        answeredAt: new Date(),
      },
    });

    return NextResponse.json(studyResult);
  } catch (error) {
    console.error('Error adding study result:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

