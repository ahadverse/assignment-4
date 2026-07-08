import { Router } from "express";

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

export default router;
