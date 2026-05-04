import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { GoogleGenAI } from "@google/genai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "models/gemini-1.0"; // default to Gemini; override via env

const genAI = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

export async function POST(req: Request) {
  // Admin-only
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - admin only" },
        { status: 403 },
      );
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Auth check failed for admin/generate:", err);
    return NextResponse.json(
      { error: "Forbidden - admin only" },
      { status: 403 },
    );
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Missing GOOGLE_API_KEY env var" },
      { status: 500 },
    );
  }

  const payload = await req.json().catch(() => ({}));
  const numQuestions = Math.max(
    1,
    Math.min(50, Number(payload.numQuestions) || 5),
  );
  const optionsPerQuestion = Math.max(
    2,
    Math.min(8, Number(payload.optionsPerQuestion) || 4),
  );
  const theme = (payload.theme || "").toString();

  const instructions =
    `Generate ${numQuestions} multiple-choice questions` +
    (theme ? ` about the topic: ${theme}` : "") +
    `. Return ONLY a JSON array. Each question object must have the fields: text (string), options (array). Each option must have fields: text (string) and isCorrect (boolean). Mark exactly one option as correct per question.`;

  try {
    const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: instructions,
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.log("erruuuuu: ", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 },
    );
  }

  // Use @google/genai library to call Gemini. Require the package to be installed.
  let rawText: string | null = null;
  try {
    let response = any;

    // Extract text from common response shapes
    rawText = response?.output_text ?? response?.text ?? null;
    if (
      !rawText &&
      response?.candidates &&
      Array.isArray(response.candidates) &&
      response.candidates[0]?.content
    ) {
      const content = response.candidates[0].content;
      rawText =
        typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content.map((c: any) => c.text || c).join("")
            : JSON.stringify(content);
    }

    if (!rawText) rawText = JSON.stringify(response);
  } catch (err: any) {
    // Fail fast: require the @google/genai library for admin generation
    // eslint-disable-next-line no-console
    console.error("@google/genai client error:", err);
    return NextResponse.json(
      {
        error:
          "Failed to use @google/genai client. Ensure '@google/genai' is installed and GOOGLE_API_KEY is set.",
      },
      { status: 500 },
    );
  }

  // Try to extract JSON array from the raw text
  let jsonText = rawText;
  const firstBracket = rawText.indexOf("[");
  if (firstBracket >= 0) jsonText = rawText.slice(firstBracket);

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    // Return raw output for debugging
    return NextResponse.json(
      { error: "Failed to parse model output as JSON", raw: rawText },
      { status: 502 },
    );
  }

  if (!Array.isArray(parsed)) {
    return NextResponse.json(
      { error: "Model output is not an array", raw: parsed },
      { status: 502 },
    );
  }

  // Normalize and attach ids
  const generated = parsed.map((q: any) => {
    const qid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : String(Math.random()).slice(2);
    const options = (Array.isArray(q.options) ? q.options : [])
      .slice(0, optionsPerQuestion)
      .map((o: any) => ({
        id:
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : String(Math.random()).slice(2),
        text: String(o.text ?? "").trim(),
        isCorrect: Boolean(o.isCorrect),
      }));

    // Ensure exactly one correct option
    if (!options.some((o) => o.isCorrect) && options.length > 0)
      options[0].isCorrect = true;

    return {
      id: qid,
      text: String(q.text ?? "").trim(),
      options,
    };
  });

  return NextResponse.json({ generated }, { status: 200 });
}
