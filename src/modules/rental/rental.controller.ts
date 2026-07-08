import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { rentalService } from "./rental.service";

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
}

export const rentalController = new RentalController();
