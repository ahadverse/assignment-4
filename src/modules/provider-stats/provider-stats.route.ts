import { Router } from "express";
import { providerStatsController } from "./provider-stats.controller";
import { authenticate, authorize } from "../../middlewares";

const router = Router();

router.get(
  "/stats",
  authenticate,
  authorize("PROVIDER"),
  providerStatsController.getOverview,
);

export default router;
