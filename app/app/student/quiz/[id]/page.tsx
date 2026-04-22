"use server";

import React from "react";
import { prisma } from "@/services/database/prisma";
import { Quiz as QuizType } from "@/app/_types/quiz";
import QuizRunner from "./_components/quizRunner";

/**
 * Student quiz taking page
 *
 * - Server component fetches the quiz with questions and options.
 * - It renders a client `QuizRunner` (below) that:
 *   - Shows one question at a time
 *   - Collects answers (single-select)
 *   - Displays a final results screen showing which questions were correct/wrong
 *     and the final grade.
 *
 * Note: To keep the implementation simple and self-contained, the client component
 * receives the quiz payload (including `option.isCorrect`) serialized from the server.
 * The UI does NOT show which answers are correct until after the student submits.
 */

type Params = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Params) {
  const { id } = await params;

  const quiz = await prisma.quiz.findFirst({
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

  console.log("inside quizrunner page, found quiz: ", quiz);

  if (!quiz) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Quiz não encontrado</h1>
        <p>O quiz que você está tentando acessar não existe.</p>
      </main>
    );
  }

  // Ensure serializable for client
  const serialized: QuizType = JSON.parse(JSON.stringify(quiz));

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Fazer Quiz: {serialized.title}
      </h1>
      {/* @ts-expect-error Server -> Client prop (serialized) */}
      <QuizRunner initialQuiz={serialized} />
    </main>
  );
}
