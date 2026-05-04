"use client";

import QuizGenerator from "../_components/generator/quizGenerator";

export default function Page() {
  return (
    <section className="p-6 mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">Novo Quiz</h1>
      <QuizGenerator />
    </section>
  );
}
