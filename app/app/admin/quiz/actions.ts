"use server";

import { prisma } from "@/services/database/prisma";
import { CreateQuizDto, Quiz } from "@/app/_types/quiz";

/**
 * Server action: create a Quiz with nested Questions and Options.
 */
export async function actionCreateQuiz(dto: CreateQuizDto) {
  // Basic runtime validation
  if (!dto || typeof dto !== "object") {
    throw new Error("Invalid payload");
  }

  const { title, questions } = dto;

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("Quiz title is required");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("At least one question is required");
  }

  // Build nested create structure for Prisma
  const questionsCreatePayload = questions.map((q, qi) => {
    if (!q || typeof q !== "object") {
      throw new Error(`Question at index ${qi} is invalid`);
    }
    const { text, options } = q;

    if (!text || typeof text !== "string" || !text.trim()) {
      throw new Error(`Question text is required (question index ${qi})`);
    }

    if (!Array.isArray(options) || options.length === 0) {
      throw new Error(
        `At least one option is required for question index ${qi}`,
      );
    }

    const optionsCreate = options.map((opt, oi) => {
      if (!opt || typeof opt !== "object") {
        throw new Error(`Option at index ${oi} for question ${qi} is invalid`);
      }
      if (!opt.text || typeof opt.text !== "string") {
        throw new Error(
          `Option text is required (question ${qi}, option ${oi})`,
        );
      }

      return {
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect ?? false),
      };
    });

    return {
      text: text,
      options: {
        create: optionsCreate,
      },
    };
  });

  try {
    const created = await prisma.quiz.create({
      data: {
        title: title.trim(),
        questions: {
          create: questionsCreatePayload,
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return created;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("actionCreateQuiz error:", error);
    }

    throw new Error("Failed to create quiz");
  }
}

/**
 * Server action: edit a Quiz with nested partial updates.
 *
 * Behavior:
 * - For provided question objects that include an `id`, update that existing question:
 *   - update question text
 *   - for options:
 *     - update options that include an `id`
 *     - create options that do NOT include an `id`
 *     - delete options in DB for that question that were NOT provided
 * - For provided questions without an `id`, create them (and their options)
 * - Delete any questions that exist in DB for this quiz but were NOT provided in the payload
 *
 * This approach preserves IDs for existing records and only creates new records for new items.
 */
export async function actionEditQuiz(dto: Quiz) {
  if (!dto || typeof dto !== "object") {
    throw new Error("Invalid payload");
  }

  const { id, title, questions } = dto as Quiz;

  if (!id || typeof id !== "string") {
    throw new Error("Quiz id is required");
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("Quiz title is required");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("At least one question is required");
  }

  // Collect provided question ids
  const providedQuestionIds: string[] = questions
    .filter((q: any) => q && typeof q === "object" && typeof q.id === "string")
    .map((q: any) => q.id as string);

  try {
    // Fetch existing question ids for this quiz
    const existingQuestions = await prisma.question.findMany({
      where: { quizId: id },
      select: { id: true },
    });
    const existingQuestionIds = existingQuestions.map((q) => q.id);

    // Determine which questions to delete (present in DB but not provided)
    const questionIdsToDelete = existingQuestionIds.filter(
      (qid) => !providedQuestionIds.includes(qid),
    );

    // Prepare a list of Prisma operations to run in a single transaction
    const ops: Array<Promise<any>> = [];

    // 1) Update quiz title first
    ops.push(
      prisma.quiz.update({
        where: { id },
        data: { title: title.trim() },
      }),
    );

    // 2) Delete questions that were removed by the client
    if (questionIdsToDelete.length > 0) {
      ops.push(
        prisma.question.deleteMany({
          where: { id: { in: questionIdsToDelete } },
        }),
      );
    }

    // 3) For each provided question, either update (if id) or create
    for (const q of questions as any[]) {
      const qid = q?.id;
      const qText = String(q.text ?? "").trim();
      const qOptions = Array.isArray(q.options) ? q.options : [];

      if (!qText) {
        throw new Error("Each question must have text");
      }
      if (!Array.isArray(qOptions) || qOptions.length === 0) {
        throw new Error("Each question must have at least one option");
      }

      // For options, separate provided ids vs new creates
      const providedOptionIds: string[] = qOptions
        .filter((o: any) => o && typeof o.id === "string")
        .map((o: any) => o.id as string);

      const optionUpdates = qOptions
        .filter((o: any) => o && typeof o.id === "string")
        .map((o: any) => ({
          where: { id: o.id },
          data: {
            text: String(o.text ?? ""),
            isCorrect: Boolean(o.isCorrect ?? false),
          },
        }));

      const optionCreates = qOptions
        .filter((o: any) => !o || typeof o.id !== "string")
        .map((o: any) => ({
          text: String(o.text ?? ""),
          isCorrect: Boolean(o.isCorrect ?? false),
        }));

      if (qid && typeof qid === "string") {
        // Update existing question and reconcile its options
        // Use nested writes: update existing options, create new ones, delete missing ones
        ops.push(
          prisma.question.update({
            where: { id: qid },
            data: {
              text: qText,
              options: {
                ...(optionUpdates.length ? { update: optionUpdates } : {}),
                ...(optionCreates.length ? { create: optionCreates } : {}),
                deleteMany: providedOptionIds.length
                  ? { id: { notIn: providedOptionIds } }
                  : {},
              },
            },
          }),
        );
      } else {
        // Create new question attached to this quiz
        ops.push(
          prisma.question.create({
            data: {
              quiz: { connect: { id } },
              text: qText,
              options: {
                create: optionCreates.length
                  ? optionCreates
                  : [
                      {
                        text: "",
                        isCorrect: false,
                      },
                    ],
              },
            },
          }),
        );
      }
    }

    // Execute each DB operation sequentially (do not run as a single transaction)
    for (const op of ops) {
      // Await each promise so operations run in the order they were added
      await op;
    }

    // Return the updated quiz with nested questions and options
    const updated = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!updated) {
      throw new Error("Quiz not found after update");
    }

    return updated;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("actionEditQuiz error:", error);
    }
    throw new Error("Failed to update quiz");
  }
}

/**
 * Server action: delete a Quiz and its dependent Questions and Options.
 *
 * Behavior:
 * - Deletes Options for the quiz's Questions (if any), then deletes Questions,
 *   and finally deletes the Quiz itself. This ordering avoids foreign-key
 *   constraint violations.
 *
 * Accepts a quiz id string and returns a simple success object on completion.
 */
export async function actionDeleteQuiz(quizId: string) {
  if (!quizId || typeof quizId !== "string") {
    throw new Error("Quiz id is required");
  }

  try {
    // Find questions belonging to the quiz
    const questions = await prisma.question.findMany({
      where: { quizId },
      select: { id: true },
    });

    const questionIds = questions.map((q) => q.id);

    // Delete options that belong to the questions (if any)
    if (questionIds.length > 0) {
      await prisma.option.deleteMany({
        where: {
          questionId: { in: questionIds },
        },
      });
    }

    // Delete questions
    await prisma.question.deleteMany({
      where: { quizId },
    });

    // Delete quiz
    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("actionDeleteQuiz error:", error);
    }
    throw new Error("Failed to delete quiz");
  }
}
