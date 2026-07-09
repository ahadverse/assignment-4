import { Router } from "express";
import { providerOrderController } from "./provider-order.controller";
import { authenticate, authorize, validateRequest } from "../../middlewares";
import { updateOrderStatusSchema } from "./provider-order.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("PROVIDER"),
  providerOrderController.getOrders,
);

router.patch(
  "/:id",
  authenticate,
  authorize("PROVIDER"),
  validateRequest(updateOrderStatusSchema),
  providerOrderController.updateStatus,
);

export default router;
