import StudentForm from "../_components/studentForm";

export default function Page() {
  return (
    <section className="p-6 mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">Novo Aluno</h1>
      <StudentForm mode="create" />
    </section>
  );
}
