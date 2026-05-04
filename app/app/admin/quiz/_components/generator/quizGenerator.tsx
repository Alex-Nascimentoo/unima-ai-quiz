"use client";

import React, { useState } from "react";
import QuizForm from "../quizForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function QuizGenerator() {
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [optionsPerQuestion, setOptionsPerQuestion] = useState<number>(4);
  const [theme, setTheme] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[] | null>(null);

  async function handleGenerate() {
    // validations
    if (numQuestions < 1 || numQuestions > 50) {
      toast.error("Número de perguntas deve ser entre 1 e 50");
      return;
    }
    if (optionsPerQuestion < 2 || optionsPerQuestion > 8) {
      toast.error("Opções por pergunta devem ser entre 2 e 8");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numQuestions, optionsPerQuestion, theme }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Falha ao gerar perguntas");
      }

      const body = await res.json();
      if (!body || !Array.isArray(body.generated)) throw new Error("Resposta inesperada");

      setGeneratedQuestions(body.generated);
      toast.success("Perguntas geradas. Revise e salve o quiz.");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao gerar");
      console.error("Generate error:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <fieldset className="p-4 border rounded space-y-3">
        <legend className="font-semibold">Gerar perguntas com AI</legend>

        <div className="flex gap-3 items-center">
          <label>
            Nº perguntas
            <input
              type="number"
              value={numQuestions}
              min={1}
              max={50}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="ml-2 w-20 rounded border px-2 py-1"
            />
          </label>

          <label>
            Opções por pergunta
            <input
              type="number"
              value={optionsPerQuestion}
              min={2}
              max={8}
              onChange={(e) => setOptionsPerQuestion(Number(e.target.value))}
              className="ml-2 w-20 rounded border px-2 py-1"
            />
          </label>

          <label className="flex-1">
            Tema
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: História do Brasil, Álgebra, Gramática"
              className="ml-2 w-full rounded border px-2 py-1"
            />
          </label>

          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Gerando..." : "Gerar com AI"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-2">As perguntas geradas aparecerão abaixo e serão carregadas no formulário. Revise antes de salvar.</p>
      </fieldset>

      {/* Render QuizForm with generated questions as initialData */}
      <div>
        <QuizForm mode="create" initialData={generatedQuestions ? { questions: generatedQuestions as any[] } : undefined} />
      </div>
    </div>
  );
}
