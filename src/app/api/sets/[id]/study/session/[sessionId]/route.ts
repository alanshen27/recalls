import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
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

    const { completedAt } = await request.json();
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

    // Update study session with completion time
    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(completedAt),
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating study session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 