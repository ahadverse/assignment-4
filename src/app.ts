import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import routes from "./routes";
import { paymentController } from "./modules/payment/payment.controller";
import { notFound } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl === "*" ? true : config.clientUrl.split(","),
    credentials: true,
  }),
);

if (config.env === "development") {
  app.use(morgan("dev"));
}

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the GearUp API. Visit /api-docs for documentation.",
    data: null,
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
