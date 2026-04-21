"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { actionSignIn, checkVerificationToken } from "../actions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isTokenSent, setIsTokenSent] = useState<boolean>(false);

  const { register, handleSubmit, formState } = useForm<{ email: string }>();

  async function onSubmit(_: { email: string }) {
    try {
      console.log("will enter actionSignIn with email: ", email);
      await actionSignIn(email);

      console.log("left actionSignIn");
      toast.success("Código Enviado", {
        description: "Verifique seu e-mail para o código de login",
      });

      setIsTokenSent(true);
    } catch (error) {
      console.log(error);

      toast.error("Erro", {
        description: "Ocorreu um erro. Por favor, tente novamente",
      });
    }
  }

  async function verifyToken() {
    const response = await checkVerificationToken(token, email);

    if (response === "error") {
      toast.error("Erro", {
        description: "Token inválido",
      });
      return;
    } else {
      router.push("/app");
    }
  }

  useEffect(() => {
    if (searchParams.get("error")) {
      toast.error("Erro", {
        description: "Token inválido",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setIsTokenSent(false);
  }, []);

  return (
    <main className="h-[100vh] flex items-center justify-center">
      <div className="mx-auto max-w-sm space-y-8">
        {!isTokenSent ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Login</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Digite seu e-mail abaixo para fazer login em sua conta
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                  {...register("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? "Enviando..." : "Enviar Código"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Login</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Digite o código enviado para o seu email
              </p>
            </div>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Código</Label>
                <Input
                  id="token"
                  placeholder="código"
                  required
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={async () => await verifyToken()}
              >
                Fazer login
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
