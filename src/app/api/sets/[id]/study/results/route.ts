import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudyResult } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { studyOptions, results } = await request.json();

    // Verify the user has access to this set
    const set = await prisma.flashcardSet.findFirst({
      where: {
        id: id,
        OR: [
          { ownerId: session.user.id },
          {
            sharedWith: {
              some: {
                sharedWithId: session.user.id
              }
            }
          },
          {
            public: true,
          }
        ]
      }
    });

    if (!set) {
      return NextResponse.json(
        { error: "Set not found or access denied" },
        { status: 404 }
      );
    }

    // Create study session
    const studySession = await prisma.studySession.create({
      data: {
        flashcardSetId: id,
        userId: session.user.id,
        studyOptions: studyOptions,
        completedAt: new Date(),
      }
    });

    // Save individual results
    const studyResults = await Promise.all(
      results.map((result: StudyResult) =>
        prisma.studyResult.create({
          data: {
            studySessionId: studySession.id,
            flashcardId: result.flashcardId,
            userAnswer: result.userAnswer,
            isCorrect: result.isCorrect,
            attempts: result.attempts,
            testTerm: result.testTerm,
            isMultipleChoice: result.isMultipleChoice,
            selectedOption: result.selectedOption,
            answeredAt: new Date(), // Explicitly set the timestamp
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      studySessionId: studySession.id,
      resultsCount: studyResults.length
    });

  } catch (error) {
    console.error("Error saving study results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get study sessions for this set and user
    const studySessions = await prisma.studySession.findMany({
      where: {
        flashcardSetId: id,
        userId: session.user.id,
      },
      include: {
        results: {
          include: {
            flashcard: true,
          },
          orderBy: {
            answeredAt: 'desc'
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 10 // Limit to last 10 sessions
    });

    return NextResponse.json(studySessions);

  } catch (error) {
    console.error("Error fetching study results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 