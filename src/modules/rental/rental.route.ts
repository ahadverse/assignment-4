import { Router } from "express";
import { rentalController } from "./rental.controller";
import { authenticate, authorize, validateRequest } from "../../middlewares";
import { createRentalSchema } from "./rental.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  validateRequest(createRentalSchema),
  rentalController.create,
);

router.get("/", authenticate, authorize("CUSTOMER"), rentalController.getMyOrders);
router.get("/:id", authenticate, rentalController.getById);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("CUSTOMER"),
  rentalController.cancel,
);

export default router;
