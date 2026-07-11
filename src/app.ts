import path from "path";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { swaggerSpec } from "./config/swagger";
import routes from "./routes";
import { paymentController } from "./modules/payment/payment.controller";
import { notFound } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";

const app: Application = express();

app.use(helmet({ contentSecurityPolicy: false }));
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
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/postman", (_req: Request, res: Response) => {
  const file = path.join(__dirname, "..", "Gear-up.postman_collection.json");
  res.download(file, "Gear-up.postman_collection.json", (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({
        success: false,
        message: "Postman collection not found",
        data: null,
      });
    }
  });
});

app.use("/api", routes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

export default app;
