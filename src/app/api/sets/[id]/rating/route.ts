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
    const { rating } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating value." }, { status: 400 });
    }

    const newRating = await prisma.rating.upsert({
      where: {
        flashcardSetId_userId: {
          flashcardSetId: setId,
          userId: userId,
        },
      },
      update: {
        rating: rating,
      },
      create: {
        flashcardSetId: setId,
        userId: userId,
        rating: rating,
      },
    });

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 