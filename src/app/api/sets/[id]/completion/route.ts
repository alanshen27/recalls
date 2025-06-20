import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import openai from "openai";

const client = new openai({
  baseURL: "https://api.cohere.ai/compatibility/v1",
  apiKey: process.env.COHERE_API_KEY,
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { word, type } = await request.json();

  if (!type) {
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
        content: `Complete the following term to its definition or definition to its term following the style given here: ${termValuePairs.join('\n')}`
      },
      {
        role: 'system',
        content: `You are an helpful system that helps autocomplete flashcards.`
      },
      {
        role: 'user',
        content: `${type =='term' ? `${word || '[not provided]'}:_____` : `_____:${word || '[not provided]'}`}. Only return the word / sentence that should be in the blank. No colons, don't do definition:term only term or definition depending on where the blank is. Please refer to the style and language and vernacular of the provided examples. If your filling a term, don't repeat any of the terms provided above.`,
      }
    ]
  });

  return NextResponse.json(response.choices[0].message.content);
}