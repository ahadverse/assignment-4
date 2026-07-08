import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate, validateRequest } from "../../middlewares";
import { updateProfileSchema } from "./user.validation";

const router = Router();

router.patch(
  "/me",
  authenticate,
  validateRequest(updateProfileSchema),
  userController.updateProfile,
);

export default router;
