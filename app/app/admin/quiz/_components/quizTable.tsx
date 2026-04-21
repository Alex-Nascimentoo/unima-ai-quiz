"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Quiz } from "@/app/_types/quiz";

interface QuizTableProps {
  initialQuizzes?: Quiz[];
}

/**
 * QuizTable
 *
 * - Uses shadcn `Table` and `DropdownMenu` components.
 * - Performs client-side delete via `DELETE /api/admin/quiz/:id`.
 * - Navigates to edit page at `/app/admin/quiz/:id/edit`.
 *
 * NOTE: Ensure the DELETE endpoint exists and is protected by middleware.
 */
export default function QuizTable({ initialQuizzes = [] }: QuizTableProps) {
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.",
    );
    if (!confirmed) return;

    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/quiz/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Falha ao deletar quiz");
      }

      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast.success("Quiz removido");
    } catch (err) {
      console.error("Failed to delete quiz", err);
      toast.error("Erro ao remover quiz");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(id: string) {
    router.push(`/app/admin/quiz/${id}/edit`);
  }

  return (
    <div>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/5">Título</TableHead>
            <TableHead className="w-1/5">Perguntas</TableHead>
            <TableHead className="w-1/5 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {quizzes.length === 0 ? (
            <TableRow>
              <TableCell className="text-center p-6" colSpan={3}>
                Nenhum quiz encontrado.
              </TableCell>
            </TableRow>
          ) : (
            quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="break-words">
                  <div className="font-medium">{quiz.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className="font-mono text-xs">ID: {quiz.id}</span>
                  </div>
                </TableCell>

                <TableCell>{quiz._count.questions ?? 99}</TableCell>

                <TableCell className="text-right">
                  {/*<div className="inline-flex items-center justify-end">*/}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label="Ações">
                        ⋯
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(quiz.id)}>
                        Editar
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleDelete(quiz.id)}
                        className="text-destructive"
                      >
                        {deletingId === quiz.id ? "Removendo..." : "Remover"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/*</div>*/}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        <TableCaption className="mt-auto">
          {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} listado
        </TableCaption>
      </Table>
    </div>
  );
}
