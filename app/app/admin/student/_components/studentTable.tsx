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
import { User } from "@/app/_types/user";
import { actionDeleteStudent } from "../actions";

interface StudentTableProps {
  initialStudents?: User[];
}

/**
 * StudentsTable
 *
 * - Client component that renders a list of students (users with role 'user').
 * - Provides Edit and Delete actions. Delete uses a client-side DELETE request
 *   to `/api/admin/user/:id` and updates local state on success.
 *
 * Note: Ensure you have a server-side DELETE endpoint at `/api/admin/user/[id]`
 * that validates permissions and only deletes users with role = 'user'.
 */
export default function StudentTable({
  initialStudents = [],
}: StudentsTableProps) {
  const router = useRouter();

  const [students, setStudents] = useState<User[]>(initialStudents);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.",
    );
    if (!confirmed) return;

    setDeletingId(id);

    try {
      await actionDeleteStudent(id);

      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Aluno removido");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete student", err);
      toast.error("Erro ao remover aluno");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(id: string) {
    router.push(`/app/admin/student/${id}/edit`);
  }

  return (
    <div>
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/5">Nome</TableHead>
            <TableHead className="w-2/5">Email</TableHead>
            <TableHead className="w-1/5 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell className="text-center p-6" colSpan={3}>
                Nenhum aluno encontrado.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="break-words">
                  <div className="font-medium">{student.name}</div>
                </TableCell>

                <TableCell>{student.email}</TableCell>

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
                      <DropdownMenuItem onClick={() => handleEdit(student.id)}>
                        Editar
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleDelete(student.id)}
                        className="text-destructive"
                      >
                        {deletingId === student.id ? "Removendo..." : "Remover"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        <TableCaption className="mt-auto">
          {students.length} {students.length === 1 ? "aluno" : "alunos"} listado
        </TableCaption>
      </Table>
    </div>
  );
}
