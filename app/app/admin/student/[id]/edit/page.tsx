"use server";

import StudentForm from "../../_components/studentForm";
import { prisma } from "@/services/database/prisma";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const student = await prisma.user.findFirst({
    where: { id, role: "user" },
    select: { id: true, name: true, email: true },
  });

  if (!student) {
    return <div className="p-6">Aluno não encontrado</div>;
  }

  return (
    <section className="p-6 mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">Editar Aluno</h1>
      <StudentForm mode="edit" initialData={student} />
    </section>
  );
}
