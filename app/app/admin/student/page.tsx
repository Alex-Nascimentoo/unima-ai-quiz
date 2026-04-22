"use server";

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/services/database/prisma";
import StudentTable from "./_components/studentTable";
import { actionDeleteStudent } from "./actions";

/**
 * Server action to delete a student (form action).
 * Ensures deletion happens on the server and then redirects back to the list.
 */
export async function deleteStudent(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) {
    return;
  }

  try {
    await actionDeleteStudent(id);
  } catch (error) {
    // In a real app you'd report this to your logging/monitoring
    // For now, log for dev visibility
    // eslint-disable-next-line no-console
    console.error("Failed to delete student:", error);
  }

  // Redirect back to students list after attempting deletion
  redirect("/app/admin/students");
}

/**
 * Admin students listing page (server component).
 * Fetches all users with role = "user" and renders a table with actions.
 */
export default async function Page() {
  const students = await prisma.user.findMany({
    where: { role: "user" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Alunos</h1>
        <Link href="/app/admin/students/new" className="inline-block">
          <button
            className="
            rounded-md bg-secondary
            px-3 py-1.5
            text-sm text-white
            "
          >
            Novo Aluno
          </button>
        </Link>
      </div>

      <hr className="mb-8" />

      <StudentTable initialStudents={students} />
    </main>
  );
}
