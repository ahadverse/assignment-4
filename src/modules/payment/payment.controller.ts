import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { paymentService } from "./payment.service";

class PaymentController {
  create = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    if (!customerId) {
      throw new UnauthorizedError("Authentication required");
    }
    const result = await paymentService.createCheckoutSession(
      customerId,
      req.body,
    );
    sendResponse(res, {
      statusCode: 201,
      message: "Payment session created successfully",
      data: result,
    });
  });
}

export const paymentController = new PaymentController();
