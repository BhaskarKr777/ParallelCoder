import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { env } from "./src/config/env.js";
import "./src/config/passport.js";
import authRoutes from "./src/routes/auth.routes.js";
import { notFound, errorHandler } from "./src/middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Parallel Coder Backend Healthy 🚀",
  });
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
