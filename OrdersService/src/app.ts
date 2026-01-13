import express from "express";
import type { Request, Response, NextFunction } from "express";
import ordersRouter from "./routes/orders.routes.js";
import logsRouter from "./routes/logs.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { console } from "inspector";

const app = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "orders" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/openapi.json", (req: Request, res: Response) => {
  res.json(swaggerSpec);
});

app.use("/orders", ordersRouter);
app.use("/logs", logsRouter);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[OrdersService] Error occurred:");
  console.error("[OrdersService] Path:", req.method, req.path);
  console.error("[OrdersService] Body:", JSON.stringify(req.body, null, 2));
  console.error("[OrdersService] Error:", err);
  console.error("[OrdersService] Stack:", err.stack);

  // Determine status code based on error type
  let statusCode = 500;
  let errorType = "Internal Server Error";

  if (err.message.includes("not found")) {
    statusCode = 404;
    errorType = "Not Found";
  } else if (err.message.includes("Missing required") || err.message.includes("Invalid")) {
    statusCode = 400;
    errorType = "Bad Request";
  } else if (err.message.includes("Access denied") || err.message.includes("Unauthorized")) {
    statusCode = 403;
    errorType = "Forbidden";
  } else if (err.message.includes("CatalogService")) {
    statusCode = 503;
    errorType = "Service Unavailable";
  }

  res.status(statusCode).json({
    error: errorType,
    message: err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`[OrdersService] 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

export default app;
