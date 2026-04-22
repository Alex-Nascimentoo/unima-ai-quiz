"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { actionCreateStudent, actionEditStudent } from "../actions";
import { CreateUserDto, User } from "@/app/_types/user";

export default function StudentForm({
  initialData,
  mode = "create",
}: {
  initialData?: { id?: string; name?: string; email?: string };
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }
    if (!email.trim()) {
      toast.error("Email é obrigatório");
      return false;
    }
    // Basic email pattern check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      toast.error("Email inválido");
      return false;
    }
    return true;
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (mode === "edit" && initialData?.id) {
        // Keep role as 'user' to avoid accidental privilege changes
        await actionEditStudent({
          id: initialData.id,
          name: name.trim(),
          email: email.trim(),
          role: "user",
        } as User);
        toast.success("Aluno atualizado com sucesso");
      } else {
        const dto: CreateUserDto = {
          name: name.trim(),
          email: email.trim(),
          role: "user",
        };
        await actionCreateStudent(dto);
        toast.success("Aluno criado com sucesso");
      }

      // Navigate back to students list
      router.push("/app/admin/student");
    } catch (error) {
      if (mode === "edit") {
        toast.error("Falha ao atualizar aluno");
      } else {
        toast.error("Falha ao criar aluno");
      }
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Student save failed:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-xl mx-auto">
      <div>
        <Label htmlFor="student-name" className="text-xl">
          Nome
        </Label>
        <Input
          id="student-name"
          placeholder="Nome do aluno"
          className="mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="student-email" className="text-xl">
          Email
        </Label>
        <Input
          id="student-email"
          placeholder="email@exemplo.com"
          className="mt-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="ml-auto" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Criar Aluno"
              : "Salvar Aluno"}
        </Button>
      </div>
    </form>
  );
}
