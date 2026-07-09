import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { providerOrderService } from "./provider-order.service";
import { listProviderOrdersSchema } from "./provider-order.validation";

class ProviderOrderController {
  getOrders = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.userId;
    if (!providerId) {
      throw new UnauthorizedError("Authentications is required");
    }
    const { query } = listProviderOrdersSchema.parse({ query: req.query });
    const { items, meta } = await providerOrderService.getProviderOrders(
      providerId,
      query,
    );
    sendResponse(res, {
      message: "Provider order retrieved successfully",
      meta,
      data: items,
    });
  });

  updateStatus = catchAsync(async (req: Request, res: Response) => {
    const providerId = req.user?.userId;
    if (!providerId) {
      throw new UnauthorizedError("Authentication is required");
    }
    const order = await providerOrderService.updateStatus(
      providerId,
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
