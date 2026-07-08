import { Router } from "express";
import { gearController } from "./gear.controller";

const router = Router();

router.get("/", gearController.getAll);
router.get("/:id", gearController.getById);

export default router;
