import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { paymentService } from "./payment.service";
import { listPaymentsSchema } from "./payment.validation";

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

  webhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const event = paymentService.constructEvent(req.body, signature);
    await paymentService.handleWebhookEvent(event);
    res.status(200).json({ received: true });
  });

  getHistory = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    if (!customerId) {
      throw new UnauthorizedError("Authentication required");
    }
    const { query } = listPaymentsSchema.parse({ query: req.query });
    const { items, meta } = await paymentService.getCustomerPayments(
      customerId,
      query,
    );
    sendResponse(res, {
      message: "Payment history retrieved successfully",
      meta,
      data: items,
    });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentication required");
    }
    const payment = await paymentService.getPaymentById(
      user.userId,
      user.role,
      req.params.id,
    );
    sendResponse(res, {
      message: "Payment retrieved successfully",
      data: payment,
    });
  });
}

export const paymentController = new PaymentController();
