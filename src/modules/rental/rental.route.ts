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

export default router;
