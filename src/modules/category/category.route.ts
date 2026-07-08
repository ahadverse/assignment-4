import { Router } from "express";
import { categoryController } from "./category.controller";
import { authenticate, authorize, validateRequest } from "../../middlewares";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

const router = Router();

router.get("/", categoryController.getAll);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateRequest(createCategorySchema),
  categoryController.create,
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(updateCategorySchema),
  categoryController.update,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.remove,
);

export default router;
