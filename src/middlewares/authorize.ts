import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../errors";

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required!!!");
    }

    if (req.user.role !== Role.ADMIN && !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        "You do not have permission to access this resource",
      );
    }

    next();
  };
};
