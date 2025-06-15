import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({
    baseURL: "https://api.cohere.ai/compatibility/v1",
    apiKey: process.env.COHERE_API_KEY,
});

export async function GET (request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const set = await prisma.flashcardSet.findUnique({
        where: { id },
        include: {
            flashcards: true,
        },
    });

    if (!set) {
        return new NextResponse("Set not found", { status: 404 });
    }

    const promptContext = `
    You are a worksheet generator. You are given a set of flashcards.

    The flashcards are:
    ${set.flashcards.map((flashcard) => `${flashcard.term} - ${flashcard.definition}`).join("\n")}

    The worksheet should be in the following format:
    {
        "questions": [
            {
                "id": "1",
                "order": 1,
                "blocks": [
                    {
                        "id": "1",
                        "content": "What is the capital of France?",
                        "type": "text",
                        "order": 1
                    }
                    {
                        "id": "2",
                        "content": "", // leave this blank
                        "type": "blank",
                        "expectedAnswer": "Paris",
                        "order": 2
                    }
                ]
            }
        ]
    }    

    Give this in plain code without any other text.
    `;

    const response = await client.chat.completions.create({     
        model: "command-r-plus",
        messages: [{ role: "user", content: promptContext }],
    });

    return NextResponse.json(response.choices[0].message.content);  

}