"use server";

import { prisma } from "@/services/database/prisma";
import { CreateUserDto, User } from "@/app/_types/user";

/**
 * Create a new student user (role = "user").
 */
export async function actionCreateStudent(dto: CreateUserDto) {
  if (!dto || typeof dto !== "object") {
    throw new Error("Invalid payload");
  }

  const { name, email, role } = dto as CreateUserDto;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Student name is required");
  }
  if (!email || typeof email !== "string" || !email.trim()) {
    throw new Error("Student email is required");
  }

  try {
    const created = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        // Always set student role to 'user' regardless of incoming payload
        role: "user",
      },
    });

    return created;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("actionCreateStudent error:", error);
    }
    throw new Error("Failed to create student");
  }
}

/**
 * Edit an existing student (keeps role 'user').
 */
export async function actionEditStudent(dto: User) {
  if (!dto || typeof dto !== "object") {
    throw new Error("Invalid payload");
  }

  const { id, name, email } = dto as User;

  if (!id || typeof id !== "string") {
    throw new Error("Student id is required");
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Student name is required");
  }
  if (!email || typeof email !== "string" || !email.trim()) {
    throw new Error("Student email is required");
  }

  try {
    // Ensure the user exists and is a student
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Student not found");
    }
    if (existing.role !== "user") {
      throw new Error("Refusing to update non-student user");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email.trim(),
        // Keep role as 'user' to avoid accidental privilege escalation
        role: "user",
      },
    });

    return updated;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("actionEditStudent error:", error);
    }
    throw new Error("Failed to update student");
  }
}

/**
 * Delete a student user (only if role === 'user').
 */
export async function actionDeleteStudent(studentId: string) {
  if (!studentId || typeof studentId !== "string") {
    throw new Error("Student id is required");
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id: studentId } });
    if (!existing) {
      throw new Error("Student not found");
    }
    if (existing.role !== "user") {
      throw new Error("Refusing to delete non-student user");
    }

    await prisma.user.delete({ where: { id: studentId } });

    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("actionDeleteStudent error:", error);
    }
    throw new Error("Failed to delete student");
  }
}
