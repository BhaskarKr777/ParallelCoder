import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./src/config/env.js";
import "./src/config/passport.js";
import authRoutes from "./src/routes/auth.routes.js";
import workspaceRoutes from "./src/routes/workspace.routes.js";
import fileRoutes from "./src/routes/file.routes.js";
import { notFound, errorHandler } from "./src/middleware/error.middleware.js";

const app = express();

/*
  Default CSP's connect-src 'self' would block the Yjs websocket,
  which runs on its own port/host even in production (see
  docker-compose.yml) and so is never same-origin.
*/
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "connect-src": ["'self'", "ws:", "wss:"],
      },
    },
  })
);
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

/*
  Baseline abuse protection for every API route. Sized to comfortably
  cover legitimate bursty use (debounced autosave across several open
  files, explorer CRUD, workspace listing) while still bounding
  scripted abuse. /api/auth/register and /login layer a much
  stricter limiter on top of this (see auth.routes.js) since those
  are the higher-risk, low-legitimate-frequency endpoints.
*/
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Parallel Coder Backend Healthy 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", fileRoutes);

/*
  Serve the built frontend (the Docker image copies Frontend's `dist`
  output in here). Everything under /api falls through to notFound
  above instead, and any other GET falls back to index.html so
  client-side routing (React Router) works on a hard refresh/deep link.
*/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "Public");

app.use(express.static(publicDir));

app.get(/^(?!\/api).*/, (_req, res, next) => {
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
