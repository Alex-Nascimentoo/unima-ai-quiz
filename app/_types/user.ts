export const userRoles = ["admin", "user"] as const;

export type UserRole = (typeof userRoles)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type CreateUserDto = Omit<User, "id">;
