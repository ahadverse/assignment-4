import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";
import categoryRoutes from "../modules/category/category.route";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Gear Up server is running",
    data: {
      service: "gearup-backend",
      timestamp: new Date().toISOString(),
    },
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);

export default router;
