import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { providerStatsService } from "./provider-stats.service";

class ProviderStatsController {
  getOverview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentication required");
    }
    const stats = await providerStatsService.getOverview(
      user.userId,
      user.role,
    );
    sendResponse(res, {
      message: "Provider statistics retrieved successfully",
      data: stats,
    });
  });
}

export const providerStatsController = new ProviderStatsController();
