"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Quiz, Question, Option } from "@/app/_types/quiz";

type Props = {
  initialQuiz: Quiz;
};

export default function QuizRunner({ initialQuiz }: Props) {
  const router = useRouter();

  const quiz = initialQuiz;
  const questions = quiz.questions ?? [];

  // selectedAnswers: map questionId -> optionId
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >(() => ({}));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // results computed upon submit
  const results = useMemo(() => {
    if (!submitted) return null;

    const perQuestion = questions.map((q) => {
      const selectedOptionId = selectedAnswers[q.id];
      const selectedOption =
        q.options?.find((o) => o.id === selectedOptionId) ?? null;
      // Determine correctness (support multiple-correct safety)
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

    return {
      perQuestion,
      correctCount,
      total,
      score,
    };
  }, [submitted, selectedAnswers, questions]);

  function toggleSelect(questionId: string, optionId: string) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function goNext() {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }

  function goPrev() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  function allAnswered(): boolean {
    return questions.every((q) => Boolean(selectedAnswers[q.id]));
  }

  function onSubmit() {
    if (!allAnswered()) {
      // Encourage the user to answer all questions before finalizing
      if (
        !confirm(
          "Você não respondeu todas as perguntas. Deseja enviar mesmo assim?",
        )
      ) {
        return;
      }
    }
    setSubmitted(true);
  }

  function onRetake() {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
  }

  if (questions.length === 0) {
    return <div>Nenhuma pergunta neste quiz.</div>;
  }

  if (submitted && results) {
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
                  ? "border-green-300 bg-green-900"
                  : "border-red-300 bg-red-900"
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

  // Not submitted UI: show current question
  const q = questions[currentIndex];

  return (
    <div className="space-y-6">
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
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                  checked ? "bg-primary/10" : ""
                }`}
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
