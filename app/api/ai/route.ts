import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  tools: [
    {
      codeExecution: {},
    },
  ],
});

/**
 * API route for generating content using Gemini AI model.
 */
export async function POST(req: Request): Promise<Response> {
  /**
   * Get the prompt from the request body.
   */
  console.log("inside ai route, and req is: ", req);
  const data = await req.json();
  const prompt = data.text || "Explain how AI works";

  /**
   * Use the Gemini AI model to generate content from the prompt.
   */

  console.log("will start generating content");
  const result = await model.generateContent(prompt);
  console.log("result content is: ", result);
  /**
   * Return the generated content as a JSON response.
   */

  console.log("will return result");
  return new Response(
    JSON.stringify({
      summary: result.response.text(),
    }),
  );
}
