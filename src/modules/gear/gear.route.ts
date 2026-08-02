import { Router } from "express";
import { gearController } from "./gear.controller";
import { reviewController } from "../review/review.controller";

const router = Router();

router.get("/", gearController.getAll);
router.get("/brands", gearController.getBrands);
router.get("/:id", gearController.getById);
router.get("/:id/reviews", reviewController.getForGear);
router.get("/:id/availability", gearController.getAvailability);

export default router;
