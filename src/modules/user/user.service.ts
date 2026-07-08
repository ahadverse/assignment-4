import prisma from "../../lib/prisma";
import { sanitizeUser, SafeUser } from "../../utils/sanitize-user";
import { NotFoundError } from "../../errors";
import { UpdateProfileInput } from "./user.validation";

class UserService {
  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<SafeUser> {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new NotFoundError("User is not found");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        address: input.address,
        profilePicture: input.profilePicture,
      },
    });

    return sanitizeUser(user);
  }
}

export const userService = new UserService();
