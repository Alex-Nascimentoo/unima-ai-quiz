"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Quiz, Question, Option } from "@/app/_types/quiz";

export default function QuizRunner({ initialQuiz }: { initialQuiz: Quiz }) {
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  function toggleSelect(questionId: string, optionId: string) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function goNext() {
    setCurrentIndex((i) => Math.min(i + 1, (quiz.questions ?? []).length - 1));
  }
  function goPrev() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  function allAnswered(): boolean {
    return (quiz.questions ?? []).every((q) => Boolean(selectedAnswers[q.id]));
  }

  function computeResults() {
    const questions = quiz.questions ?? [];
    const perQuestion = questions.map((q) => {
      const selectedOptionId = selectedAnswers[q.id];
      const selectedOption =
        q.options?.find((o) => o.id === selectedOptionId) ?? null;
      const correctOptions = (q.options ?? []).filter((o) => o.isCorrect);
      const isCorrect = selectedOption
        ? selectedOption.isCorrect === true
        : false;
      return {
        questionId: q.id,
        text: q.text,
        selectedOption,
        correctOptions,
        isCorrect,
      };
    });

    const correctCount = perQuestion.reduce(
      (acc, r) => acc + (r.isCorrect ? 1 : 0),
      0,
    );
    const total = perQuestion.length;
    const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);

    return { perQuestion, correctCount, total, score };
  }

  function onSubmit() {
    if (!allAnswered()) {
      if (
        !confirm(
          "Você não respondeu todas as perguntas. Deseja enviar mesmo assim?",
        )
      )
        return;
    }
    setSubmitted(true);
  }

  function onRetake() {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
  }

  const questions = quiz.questions ?? [];

  if (questions.length === 0) {
    return (
      <div>
        <p>Nenhuma pergunta disponível para este quiz.</p>
        <div className="mt-4">
          <button
            className="rounded-md bg-secondary text-white px-3 py-1"
            onClick={() => router.push("/app/student/quiz")}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // If submitted show results
  if (submitted) {
    const results = computeResults();
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Resultados</h2>
        <div className="p-4 border rounded">
          <p>
            Você acertou {results.correctCount} de {results.total} perguntas.
          </p>
          <p className="text-lg font-bold">Nota: {results.score}%</p>
        </div>

        <div className="space-y-4">
          {results.perQuestion.map((r, idx) => (
            <div
              key={r.questionId}
              className={`p-4 rounded border ${
                r.isCorrect
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <div className="font-medium mb-2">
                {idx + 1}. {r.text}
              </div>

              <div className="mb-2">
                <strong>Sua resposta:</strong>{" "}
                {r.selectedOption ? r.selectedOption.text : "Sem resposta"}
              </div>

              {!r.isCorrect && (
                <div>
                  <strong>Resposta correta:</strong>{" "}
                  {r.correctOptions.length > 0
                    ? r.correctOptions.map((o) => o.text).join(", ")
                    : "Não disponível"}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            className="ml-auto rounded bg-secondary px-4 py-2 text-white"
            onClick={() => router.push("/app/student/quiz")}
          >
            Voltar à lista de quizzes
          </button>
          <button className="rounded border px-4 py-2" onClick={onRetake}>
            Refazer quiz
          </button>
        </div>
      </div>
    );
  }

  // Not submitted: show top generation controls and question UI
  const q = questions[currentIndex];

  return (
    <div className="space-y-6">
      {/* Question UI */}
      <div className="flex items-center justify-between">
        <div>
          Pergunta {currentIndex + 1} de {questions.length}
        </div>
        <div>
          Progresso:{" "}
          {Math.round(
            ((Object.keys(selectedAnswers).filter((id) =>
              Boolean(selectedAnswers[id]),
            ).length || 0) /
              Math.max(1, questions.length)) *
              100,
          )}
          %
        </div>
      </div>

      <div className="p-4 border rounded space-y-4">
        <div className="font-medium text-lg">{q.text}</div>

        <div className="space-y-2">
          {q.options?.map((opt) => {
            const checked = selectedAnswers[q.id] === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${checked ? "bg-primary/10" : ""}`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={checked}
                  onChange={() => toggleSelect(q.id, opt.id)}
                />
                <span>{opt.text}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="rounded border px-4 py-2"
        >
          Anterior
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="ml-auto rounded bg-secondary px-4 py-2 text-white"
          >
            Próxima
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            className="ml-auto rounded bg-secondary px-4 py-2 text-white"
            disabled={
              Object.keys(selectedAnswers).length === 0 && questions.length > 0
            }
          >
            Enviar respostas
          </button>
        )}
      </div>
    </div>
  );
}
