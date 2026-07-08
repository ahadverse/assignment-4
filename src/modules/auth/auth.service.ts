import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { config } from "../../config";
import { signToken } from "../../utils/jwt";
import { sanitizeUser, SafeUser } from "../../utils/sanitize-user";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors";
import { LoginInput, RegisterInput } from "./auth.validation";

interface AuthResult {
  user: SafeUser;
  token: string;
}

class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(
      input.password,
      config.bcryptSaltRounds,
    );

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        phone: input.phone,
        role: input.role,
        address: input.address,
        profilePicture: input.profilePicture,
      },
    });

    const token = signToken({ userId: user.id, role: user.role });
    return { user: sanitizeUser(user), token };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.status === "SUSPENDED") {
      throw new ForbiddenError("Your account has been suspended");
    }

    const token = signToken({ userId: user.id, role: user.role });
    return { user: sanitizeUser(user), token };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return sanitizeUser(user);
  }
}

export const authService = new AuthService();
