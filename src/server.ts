import app from "./app";
import { config } from "./config";
import prisma from "./lib/prisma";

async function mainServer() {
  try {
    await prisma.$connect();
    console.log("Connected to the database");

    const server = app.listen(config.port, () => {
      console.log(`Gear Up server is running on port ${config.port}`);
    });

    const shutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

mainServer();
