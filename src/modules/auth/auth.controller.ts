import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { authService } from "./auth.service";

class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendResponse(res, {
      statusCode: 201,
      message: "Registration successful",
      data: result,
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendResponse(res, {
      message: "Login successful",
      data: result,
    });
  });

  me = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }
    const user = await authService.getProfile(userId);
    sendResponse(res, {
      message: "Current user retrieved successfully",
      data: user,
    });
  });
}

export const authController = new AuthController();
