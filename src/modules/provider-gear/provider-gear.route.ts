import { Router } from "express";
import { providerGearController } from "./provider-gear.controller";
import { authenticate, authorize, validateRequest } from "../../middlewares";
import { createGearSchema, updateGearSchema } from "./provider-gear.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("PROVIDER"),
  validateRequest(createGearSchema),
  providerGearController.create,
);

router.put(
  "/:id",
  authenticate,
  authorize("PROVIDER"),
  validateRequest(updateGearSchema),
  providerGearController.update,
);

router.delete(
  "/:id",
  authenticate,
  authorize("PROVIDER"),
  providerGearController.remove,
);

export default router;
