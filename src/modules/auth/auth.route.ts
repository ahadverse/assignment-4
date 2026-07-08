import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate, validateRequest } from "../../middlewares";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);

router.post("/login", validateRequest(loginSchema), authController.login);

router.get("/me", authenticate, authController.me);

export default router;
