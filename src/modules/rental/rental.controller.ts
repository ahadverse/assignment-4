import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { rentalService } from "./rental.service";
import { listRentalsSchema } from "./rental.validation";

class RentalController {
  create = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    if (!customerId) {
      throw new UnauthorizedError("Authentication required");
    }
    const order = await rentalService.create(customerId, req.body);
    sendResponse(res, {
      statusCode: 201,
      message: "Rental order placed successfully",
      data: order,
    });
  });

  getMyOrders = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    if (!customerId) {
      throw new UnauthorizedError("Authentication required");
    }
    const { query } = listRentalsSchema.parse({ query: req.query });
    const { items, meta } = await rentalService.getCustomerOrders(
      customerId,
      query,
    );
    sendResponse(res, {
      message: "Rental orders retrieved successfully",
      meta,
      data: items,
    });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentication required");
    }
    const order = await rentalService.getByIdForUser(
      user.userId,
      user.role,
      req.params.id,
    );
    sendResponse(res, {
      message: "Rental order retrieved successfully",
      data: order,
    });
  });
}

export const rentalController = new RentalController();
