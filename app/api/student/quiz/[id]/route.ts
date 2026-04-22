import { prisma } from "@/services/database/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/student/quiz/:id
 *
 * Returns the quiz payload including questions and options.
 * NOTE: this response includes the `isCorrect` flags on options (they come
 * from the server). The front-end quiz runner in this project currently
 * computes the student's score client-side using those flags.
 *
 * If you prefer to avoid exposing correct answers to the client prior to
 * submission, remove `isCorrect` from the returned option objects here and
 * adjust the client to only receive correctness after submission.
 */
export async function GET(
  _req: Request,
  { params }: { params?: { id?: string } },
) {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing quiz id" }, { status: 400 });
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { id: "asc" },
          include: {
            options: {
              orderBy: { id: "asc" },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Return the quiz as-is (includes option.isCorrect)
    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch quiz for student:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
