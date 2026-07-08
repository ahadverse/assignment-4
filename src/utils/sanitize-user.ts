import { User } from "@prisma/client";

export type SafeUser = Omit<User, "password">;

export const sanitizeUser = (user: User): SafeUser => {
  const { password: _password, ...rest } = user;
  return rest;
};
