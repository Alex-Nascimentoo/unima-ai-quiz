import React from "react";
import { prisma } from "@/services/database/prisma";
import QuizFormClient from "@/app/app/admin/quiz/_components/quizForm";
import { redirect } from "next/navigation";

/**
 * Edit page for a quiz.
 *
 * This page:
 * - loads the quiz (with questions and options) on the server
 * - renders a client-side form component pre-filled with the quiz data
 *
 * Note: The client form will send an update request to an endpoint such as
 * `/api/admin/quiz/:id` (PUT/PATCH). Make sure you have an API route or server
 * action to accept and persist the update.
 */

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  // Fetch quiz with nested questions and options
  const quiz = await prisma.quiz.findFirst({
    where: { id },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) {
    // If the quiz doesn't exist, redirect back to the admin list
    redirect("/app/admin/quiz");
  }

  // Build the initial DTO shape matching the client form expectations
  const initialData = {
    id: quiz!.id,
    title: quiz!.title,
    questions: (quiz!.questions || []).map((q) => ({
      id: q.id,
      text: q.text,
      options: (q.options || []).map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    })),
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar Quiz</h1>
      </div>

      <section className="max-w-3xl mx-auto">
        {/* The client form component should accept props to prefill data and handle update.
            If the existing `QuizForm` component doesn't accept initial data, you can
            adapt it to accept `initialData` and an `onSubmit` handler, or replace it
            with another client-side form that does. */}
        {/* @ts-expect-error Server -> Client prop: passing serializable data */}
        <QuizFormClient initialData={initialData} mode="edit" />
      </section>
    </main>
  );
}
