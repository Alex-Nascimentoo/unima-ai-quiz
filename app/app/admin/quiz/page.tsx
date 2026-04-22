"use server";

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/services/database/prisma";
import QuizTable from "./_components/quizTable";

/**
 * Server action to delete a quiz and its dependent questions/options.
 * - This runs on the server as a form action (Next.js server action).
 * - It attempts to remove options -> questions -> quiz to avoid FK restriction errors.
 */
export async function deleteQuiz(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }

  try {
    // Find questions belonging to the quiz
    const questions = await prisma.question.findMany({
      where: { quizId: id },
      select: { id: true },
    });

    const questionIds = questions.map((q) => q.id);

    // Delete options that belong to the questions (if any)
    if (questionIds.length > 0) {
      await prisma.option.deleteMany({
        where: {
          questionId: { in: questionIds },
        },
      });
    }

    // Delete questions
    await prisma.question.deleteMany({
      where: { quizId: id },
    });

    // Delete quiz
    await prisma.quiz.delete({
      where: { id },
    });

    // Redirect back to this list after deletion
    redirect("/app/admin/quiz");
  } catch (error) {
    // In a real app you'd report this to your logging/monitoring
    // For now, a simple console.error for dev visibility
    // eslint-disable-next-line no-console
    console.error("Failed to delete quiz:", error);
    // Redirect back even on error so the admin doesn't get stuck
    redirect("/app/admin/quiz");
  }
}

/**
 * Admin quiz listing page (server component).
 * Fetches all quizzes and renders a table. Each row exposes a three-dot
 * action menu with Edit and Delete.
 */
export default async function Page() {
  // Fetch quizzes with question counts
  const quizzes = await prisma.quiz.findMany({
    orderBy: { title: "asc" },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Link href="/app/admin/quiz/new" className="inline-block">
          <button
            className="
            rounded-md bg-secondary
            px-3 py-1.5
            text-sm text-white
            "
          >
            Novo Quiz
          </button>
        </Link>
      </div>

      <hr className="mb-8" />

      <QuizTable initialQuizzes={quizzes} />
    </main>
  );
}
