import { Router } from "express";
import rateLimit from "express-rate-limit";

import passport, { oauthAvailability } from "../config/passport.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  register,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  oauthCallback,
  getRedirectUrl,
} from "../controllers/auth.controller.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);

const requireStrategy = (provider) => (req, res, next) => {
  if (!oauthAvailability[provider]) {
    return res.status(501).json({
      success: false,
      message: `${provider} sign-in is not configured on this server yet`,
    });
  }
  next();
};

const handleOAuthCallback = (provider) => (req, res, next) => {
  passport.authenticate(provider, { session: false }, (err, user, info) => {
    if (res.headersSent) return;

    if (err || !user) {
      logger.error({ err, info, provider }, "OAuth authentication callback failed");
      const msg = err?.message || info?.message || `${provider} authentication failed`;
      const targetUrl = getRedirectUrl(req, "/login", msg);
      return res.redirect(targetUrl);
    }
    req.user = user;
    oauthCallback(req, res);
  })(req, res, next);
};

router.get(
  "/google",
  requireStrategy("google"),
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  requireStrategy("google"),
  handleOAuthCallback("google")
);

router.get(
  "/github",
  requireStrategy("github"),
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

router.get(
  "/github/callback",
  requireStrategy("github"),
  handleOAuthCallback("github")
);

export default router;
