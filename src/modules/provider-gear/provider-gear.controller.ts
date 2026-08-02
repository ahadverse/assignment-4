import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { providerGearService } from "./provider-gear.service";
import { listProviderGearSchema } from "./provider-gear.validation";

class ProviderGearController {
  getMyGear = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentication required");
    }
    const { query } = listProviderGearSchema.parse({ query: req.query });
    const { items, meta } = await providerGearService.getMyGear(
      user.userId,
      user.role,
      query,
    );
    sendResponse(res, {
      message: "Gear retrieved successfully",
      meta,
      data: items,
    });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.userId;
    if (!providerId) {
      throw new UnauthorizedError("Authentication are required");
    }
    const gear = await providerGearService.create(providerId, req.body);
    sendResponse(res, {
      statusCode: 201,
      message: "Gear is added successfully",
      data: gear,
    });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentication are required");
    }
    const gear = await providerGearService.update(
      user.userId,
      user.role,
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      message: "Gear updated successfully",
      data: gear,
    });
  });

  remove = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentication required");
    }
    await providerGearService.remove(user.userId, user.role, req.params.id);
    sendResponse(res, {
      message: "Gear removed successfully",
    });
  });
}

export const providerGearController = new ProviderGearController();
