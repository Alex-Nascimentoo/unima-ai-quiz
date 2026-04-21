export type Option = {
  id: string;
  text?: string;
  isCorrect?: boolean;
};

export type Question = {
  id: string;
  text?: string;
  options?: Option[];
};

export type Quiz = {
  id: string;
  title: string;
  questions?: Question[];
};

/**
 * DTOs for creating a Quiz with nested Questions and Options
 */

export type CreateOptionDto = {
  text: string;
  isCorrect?: boolean;
};

export type CreateQuestionDto = {
  text: string;
  options: CreateOptionDto[];
};

export type CreateQuizDto = {
  title: string;
  questions: CreateQuestionDto[];
};
