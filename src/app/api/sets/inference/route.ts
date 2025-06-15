import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({
    baseURL: "https://api.cohere.ai/compatibility/v1",
    apiKey: process.env.COHERE_API_KEY,
});

interface Flashcard {
    term: string;
    definition: string;
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        const { notes, title } = await request.json();

        if (!notes || !title) {
            return new NextResponse("Notes and title are required", { status: 400 });
        }

        const promptContext = `
        You are a flashcard generator. You are given the following notes. You must generate flashcards on ALL of the key terms in the flashcard and return it in pure JSON like an API endpoint.

        the notes are:

        ${notes}

        The flashcards should be in the following format:
        [
            {
                term: 'Globalization',
                definition: 'The .... of many different countries',
            }
        ]    
        `.replace(/```json/g, "").replace(/```/g, "");

        const flashcardsResponse = await client.chat.completions.create({     
            model: "command-r-plus",
            messages: [{ role: "user", content: promptContext }],
        });

        const generatedFlashcards = flashcardsResponse.choices[0].message.content;

        if (!generatedFlashcards) {
            return new NextResponse("No flashcards found", { status: 404 });
        }

        console.log('Raw response:', generatedFlashcards);

        // Remove markdown code block markers and get just the JSON
        const jsonContent = generatedFlashcards
            .replace(/^```json\n/, '')  // Remove opening ```json
            .replace(/\n```$/, '')      // Remove closing ```
            .trim();                    // Remove any extra whitespace

        const flashcardsArray = JSON.parse(jsonContent);

        const flashcards = flashcardsArray.map((flashcard: Flashcard) => ({
            term: flashcard.term,
            definition: flashcard.definition,
        }));

        const newSet = await prisma.flashcardSet.create({
            data: { 
                title,
                flashcards: {
                    create: flashcards,
                },
            },
            include: {
                flashcards: true,
            },
        })
        
        const response = NextResponse.json({
            id: newSet.id,
            flashcards: newSet.flashcards,
        });  

        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return response;
    } catch (error) {
        console.error('Error in inference:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
