import { createSession, deleteSession } from "@/lib/session";
import { prisma } from "../database/prisma";

export async function login(email: string) {
  const obj = await prisma.user.findFirst({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!obj) {
    return "error";
  }

  await createSession({
    userId: obj.id,
    email: obj.email,
    name: obj.name!,
    role: obj.role,
  });

  return "success";
}

export async function logout() {
  await deleteSession();
}
