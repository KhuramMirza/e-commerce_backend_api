import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import morgan from "morgan";

import { productRoutes } from "./modules/product/product.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { cartRoutes } from "./modules/cart/cart.routes.js";
import { orderRoutes } from "./modules/order/order.routes.js";
import { webhookCheckout } from "./modules/payment/webhook.controller.js";
const app: Application = express();

// ======================================================
// 1. GLOBAL MIDDLEWARE (Security & Utilities)
// ======================================================

// Security Headers (Hides "X-Powered-By: Express")
app.use(helmet());

// CORS (Allows your frontend to talk to this backend)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Allow all for now, lock it down later
    credentials: true,
  }),
);

// 🚨 IMPORTANT: Define Webhook route BEFORE express.json()
// We use 'express.raw' specifically for this route so the signature works
app.post(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  webhookCheckout,
);

// Logging (See requests in your console)
app.use(morgan("dev"));

// Body Parser (Read JSON data from req.body)
app.use(express.json({ limit: "10kb" }));

// Prevent Parameter Pollution (Fixes ?sort=price&sort=name)
app.use(hpp());

// ======================================================
// 2. ROUTES
// ======================================================
// This is where we mount your features
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

// Health Check (To verify server is running)
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ======================================================
// 3. GLOBAL ERROR HANDLER
// ======================================================
// Express 5 catches async errors automatically, so they end up here
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(err); // Log the error for you to debug

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
