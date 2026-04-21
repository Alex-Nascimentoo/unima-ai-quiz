"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { actionCreateQuiz, actionEditQuiz } from "../actions";
import { CreateQuestionDto, CreateOptionDto } from "@/app/_types/quiz";

export default function QuizForm({
  initialData,
  mode = "create",
}: {
  initialData?: {
    id?: string;
    title?: string;
    questions?: {
      id?: string;
      text?: string;
      options?: { id?: string; text?: string; isCorrect?: boolean }[];
    }[];
  };
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  let saveBtnText = mode === "create" ? "Criar Quiz" : "Salvar Quiz";

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [questions, setQuestions] = useState<CreateQuestionDto[]>(() => {
    if (initialData?.questions && Array.isArray(initialData.questions)) {
      return initialData.questions.map((q: any) => ({
        text: q.text ?? "",
        options:
          Array.isArray(q.options) && q.options.length > 0
            ? q.options.map((o: any) => ({
                text: o.text ?? "",
                isCorrect: Boolean(o.isCorrect),
              }))
            : [{ text: "", isCorrect: false }],
      }));
    }

    return [
      {
        text: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setQuestionText(index: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, text: value } : q)),
    );
  }

  function setOptionText(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIndex ? { ...o, text: value } : o,
              ),
            }
          : q,
      ),
    );
  }

  function toggleOptionCorrect(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIndex ? { ...o, isCorrect: !o.isCorrect } : o,
              ),
            }
          : q,
      ),
    );
  }

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { text: "", options: [{ text: "", isCorrect: false }] },
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function addOption(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...q.options, { text: "", isCorrect: false }] }
          : q,
      ),
    );
  }

  function removeOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              // prevent removing last option
              options:
                q.options.length <= 1
                  ? q.options
                  : q.options.filter((_, j) => j !== oIndex),
            }
          : q,
      ),
    );
  }

  function validatePayload() {
    if (!title.trim()) {
      toast.error("Título do quiz é obrigatório");
      return false;
    }
    if (questions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta");
      return false;
    }

    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q.text.trim()) {
        toast.error(`A pergunta ${qi + 1} precisa de texto`);
        return false;
      }
      if (!Array.isArray(q.options) || q.options.length === 0) {
        toast.error(`A pergunta ${qi + 1} precisa de pelo menos uma opção`);
        return false;
      }
      for (let oi = 0; oi < q.options.length; oi++) {
        const o = q.options[oi];
        if (!o.text.trim()) {
          toast.error(
            `A opção ${oi + 1} da pergunta ${qi + 1} precisa de texto`,
          );
          return false;
        }
      }
    }

    return true;
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!validatePayload()) return;

    setIsSubmitting(true);

    const dto = {
      title: title.trim(),
      questions: questions.map((q) => ({
        text: q.text.trim(),
        options: q.options.map((o) => ({
          text: o.text.trim(),
          isCorrect: o.isCorrect,
        })),
      })),
    };

    try {
      if (mode === "edit" && initialData?.id) {
        // Update existing quiz via API (PUT). Ensure this endpoint exists server-side.
        // const res = await fetch(
        //   `/api/admin/quiz/${encodeURIComponent(initialData.id)}`,
        //   {
        //     method: "PUT",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(dto),
        //   },
        // );

        // if (!res.ok) {
        //   const text = await res.text().catch(() => null);
        //   throw new Error(text || "Falha ao atualizar quiz");
        // }

        const edited = await actionEditQuiz({ ...dto, id: initialData.id });
        toast.success("Quiz atualizado com sucesso");
      } else {
        // Create new quiz using existing server action
        const created = await actionCreateQuiz(dto);
        toast.success("Quiz criado com sucesso");
      }

      // Navigate back to list
      router.push("/app/admin/quiz");
    } catch (error) {
      toast.error(
        mode === "edit" ? "Falha ao atualizar quiz" : "Falha ao criar quiz",
      );
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Quiz save failed:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="
      space-y-6
      max-w-xl mx-auto
      "
    >
      <div>
        <Label htmlFor="quiz-title" className="text-xl">
          Título
        </Label>
        <Input
          id="quiz-title"
          placeholder="Título do quiz"
          className="mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <fieldset
            key={qi}
            className="rounded-md border p-4 border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="text-lg">{`Pergunta ${qi + 1}`}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(qi)}
                >
                  + Opção
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(qi)}
                  disabled={questions.length <= 1}
                >
                  Remover Pergunta
                </Button>
              </div>
            </div>

            <div>
              <Textarea
                placeholder="Texto da pergunta"
                value={q.text}
                onChange={(e) => setQuestionText(qi, e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              {q.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    id={`q-${qi}-o-${oi}-correct`}
                    type="checkbox"
                    checked={o.isCorrect}
                    onChange={() => toggleOptionCorrect(qi, oi)}
                    className="h-4 w-4"
                  />
                  <Input
                    placeholder={`Opção ${oi + 1}`}
                    value={o.text}
                    onChange={(e) => setOptionText(qi, oi, e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(qi, oi)}
                    disabled={q.options.length <= 1}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={addQuestion}>
          + Adicionar Pergunta
        </Button>

        <Button type="submit" className="ml-auto" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : saveBtnText}
        </Button>
      </div>
    </form>
  );
}
