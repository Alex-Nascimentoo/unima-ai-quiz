import { Suspense } from "react";
import { AuthForm } from "./_components/authForm";

export default function Page() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
