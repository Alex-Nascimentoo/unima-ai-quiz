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
 */
export default function QuizTable({ initialQuizzes = [] }: QuizTableProps) {
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);

  function handleDoQuiz(id: string) {
    // Navigate the student to the quiz-taking page for the selected quiz
    router.push(`/app/student/quiz/${encodeURIComponent(id)}`);
  }

  return (
    <div>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-secondary">
            <TableHead className="w-3/5 font-bold text-lg">Título</TableHead>
            <TableHead className="w-1/5 font-bold text-lg">Perguntas</TableHead>
            <TableHead className="w-1/5 text-right font-bold text-lg">
              Ações
            </TableHead>
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
                </TableCell>

                <TableCell>{quiz._count.questions ?? "00"}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Ações"
                        className="cursor-pointer"
                      >
                        ⋯
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDoQuiz(quiz.id)}>
                        Fazer quiz
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
