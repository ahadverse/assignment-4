import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authenticate, authorize, validateRequest } from "../../middlewares";
import { confirmPaymentSchema, createPaymentSchema } from "./payment.validation";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize("CUSTOMER"),
  validateRequest(createPaymentSchema),
  paymentController.create,
);

router.post(
  "/confirm",
  authenticate,
  authorize("CUSTOMER"),
  validateRequest(confirmPaymentSchema),
  paymentController.confirm,
);

router.get("/", authenticate, authorize("CUSTOMER"), paymentController.getHistory);
router.get("/:id", authenticate, paymentController.getById);

export default router;
