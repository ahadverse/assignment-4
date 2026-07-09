import { Router } from "express";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";
import categoryRoutes from "../modules/category/category.route";
import gearRoutes from "../modules/gear/gear.route";
import providerGearRoutes from "../modules/provider-gear/provider-gear.route";
import providerOrderRoutes from "../modules/provider-order/provider-order.route";
import rentalRoutes from "../modules/rental/rental.route";
import paymentRoutes from "../modules/payment/payment.route";
import reviewRoutes from "../modules/review/review.route";
import adminRoutes from "../modules/admin/admin.route";

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
router.use("/gear", gearRoutes);
router.use("/provider/gear", providerGearRoutes);
router.use("/provider/orders", providerOrderRoutes);
router.use("/rentals", rentalRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);

export default router;
