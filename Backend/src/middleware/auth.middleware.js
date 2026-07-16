import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { getUserById } from "../services/auth.service.js";

export const requireAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await getUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
};
