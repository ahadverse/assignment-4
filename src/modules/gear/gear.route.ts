import { Router } from "express";
import { gearController } from "./gear.controller";
import { reviewController } from "../review/review.controller";

const router = Router();

router.get("/", gearController.getAll);
router.get("/:id", gearController.getById);
router.get("/:id/reviews", reviewController.getForGear);

export default router;
