import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authenticate, authorize, validateRequest } from "../../middlewares";
import { createPaymentSchema } from "./payment.validation";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize("CUSTOMER"),
  validateRequest(createPaymentSchema),
  paymentController.create,
);

export default router;
