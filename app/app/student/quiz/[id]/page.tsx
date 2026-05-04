"use server";

import React from "react";
import { prisma } from "@/services/database/prisma";
import { Quiz as QuizType } from "@/app/_types/quiz";
import QuizRunner from "./_components/quizRunner";

type Params = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Params) {
  const { id } = params;

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
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Quiz não encontrado</h1>
        <p>O quiz que você está tentando acessar não existe.</p>
      </main>
    );
  }

  // Serialize for client
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
