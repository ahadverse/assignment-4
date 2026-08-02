import { Router } from "express";
import { adminController } from "./admin.controller";
import { authenticate, authorize, validateRequest } from "../../middlewares";
import { updateUserStatusSchema } from "./admin.validation";

const router = Router();

router.get("/stats", authenticate, authorize("ADMIN"), adminController.getStats);

router.get("/users", authenticate, authorize("ADMIN"), adminController.getUsers);

router.patch(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus,
);

router.get("/gear", authenticate, authorize("ADMIN"), adminController.getGear);

router.get(
  "/rentals",
  authenticate,
  authorize("ADMIN"),
  adminController.getRentals,
);

export default router;
