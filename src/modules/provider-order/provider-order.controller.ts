import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { providerOrderService } from "./provider-order.service";
import { listProviderOrdersSchema } from "./provider-order.validation";

class ProviderOrderController {
  getOrders = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentications is required");
    }
    const { query } = listProviderOrdersSchema.parse({ query: req.query });
    const { items, meta } = await providerOrderService.getProviderOrders(
      user.userId,
      user.role,
      query,
    );
    sendResponse(res, {
      message: "Provider order retrieved successfully",
      meta,
      data: items,
    });
  });

  updateStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentication is required");
    }
    const order = await providerOrderService.updateStatus(
      user.userId,
      user.role,
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      message: "Order status updated successfully",
      data: order,
    });
  });
}

export const providerOrderController = new ProviderOrderController();
