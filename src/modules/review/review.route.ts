import { Router } from "express";
import { reviewController } from "./review.controller";
import { authenticate, authorize, validateRequest } from "../../middlewares";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  validateRequest(createReviewSchema),
  reviewController.create,
);

export default router;
