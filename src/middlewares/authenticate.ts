import { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma";
import { JwtPayload, verifyToken } from "../utils/jwt";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { catchAsync } from "../utils/catch-async";

export const authenticate = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token token is missing");
    }

    const token = header.split(" ")[1];

    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError("The user for this token is not existed");
    }

    if (user.status === "SUSPENDED") {
      throw new ForbiddenError("Your account has been suspended");
    }

    req.user = { userId: user.id, role: user.role };
    next();
  },
);
