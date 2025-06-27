import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


  await prisma.flashcardSet.deleteMany({
    where: {
      ownerId: session.user.id,
    },
  });

  await prisma.sharedSet.deleteMany({
    where: {
      sharedWithId: session.user.id,
    },
  });

  await prisma.notification.deleteMany({
    where: {
      userId: session.user.id,
    },
  });

  await prisma.user.delete({
    where: {
      id: session.user.id,
    },
  });

  return NextResponse.json({ message: "Account deleted" }, { status: 200 });
}