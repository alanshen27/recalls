import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cohere.ai/compatibility/v1",
  apiKey: process.env['COHERE_API_KEY'], // This is the default and can be omitted
});


export const POST = async (request: NextRequest) => {
    const { text } = await request.json();

    const response = await client.chat.completions.create({
        model: "command-r-plus",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that generates flashcards from a given text. \n You will return a string or the flashcard seperated by a new line. \n The term and definition should be separated by a comma. \n The term and definition should be in the following format: \n term,definition"
            },
            {
                role: "system",
                content: "For example, if the user asks you to generate flashcards for the topic of 'JavaScript', you will return a string or the flashcard seperated by a new line. \n The term and definition should be separated by a comma. \n The term and definition should be in the following format: \n term,definition: \n JavaScript,Programming language\nString,A data type that represents a sequence of characters\n...continue with the flashcards"
            },
            {
                role: "user",
                content: text
            }
        ],
        max_tokens: 1000,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
    });

    return NextResponse.json({ 
        flashcards: response.choices[0].message.content,
     });
}