"use server";

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/services/database/prisma";
import QuizTable from "./_components/quizTable";

/**
 * Student quiz listing page (server component).
 * Fetches all quizzes and renders a table. Each row exposes a three-dot
 * action menu with Do Quiz.
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
      </div>

      <hr className="mb-8" />

      <QuizTable initialQuizzes={quizzes} />
    </main>
  );
}
