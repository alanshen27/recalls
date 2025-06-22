import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setId = params.id;
    const userId = session.user.id;

    const existing = await prisma.studyingSet.findUnique({
      where: {
        flashcardSetId_userId: {
          flashcardSetId: setId,
          userId: userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already studying this set." },
        { status: 200 }
      );
    }

    await prisma.studyingSet.create({
      data: {
        flashcardSetId: setId,
        userId: userId,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error adding set to studying:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setId = params.id;
    const userId = session.user.id;

    await prisma.studyingSet.delete({
      where: {
        flashcardSetId_userId: {
          flashcardSetId: setId,
          userId: userId,
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error removing set from studying:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 