import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import openai from "openai";

const client = new openai({
  baseURL: "https://api.cohere.ai/compatibility/v1",
  apiKey: process.env.COHERE_API_KEY,
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { term } = await request.json();

  if (!term) {
    return NextResponse.json({ error: "Term is required" }, { status: 400 });
  }

  const set = await prisma.flashcardSet.findUnique({
    where: { id },
  });

  if (!set) {
    return NextResponse.json({ error: "Set not found" }, { status: 404 });
  }

  const flashcards = await prisma.flashcard.findMany({
    where: {
      flashcardSetId: id,
    },
    select: {
      term: true,
      definition: true,
    },
  });

  const termValuePairs: string[] = flashcards.filter((flashcard) => flashcard.term?.length && flashcard.definition?.length).map((flashcard) => `${flashcard.term}:${flashcard.definition}`);

  const response = await client.chat.completions.create({
    model: 'command-r',
    messages: [
      {
        role: 'system',
        content: `Complete the following term to its definition following the style given here: ${termValuePairs.join('\n')}`
      },
      {
        role: 'user',
        content: `Give me a definition for the term: ${term}. In your output only include the definition, no other text.`
      }
    ]
  });

  return NextResponse.json(response.choices[0].message.content);
}