import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { userService } from "./user.service";

class UserController {
  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }
    const user = await userService.updateProfile(userId, req.body);
    sendResponse(res, {
      message: "Profile updated successfuly",
      data: user,
    });
  });
}

export const userController = new UserController();
