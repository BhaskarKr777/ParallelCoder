import { z } from "zod";

import { env } from "../config/env.js";
import {
  registerLocalUser,
  loginLocalUser,
  issueTokens,
  verifyRefreshToken,
  revokeAllSessions,
  getUserById,
} from "../services/auth.service.js";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  sameSite: "lax",
  secure: isProd,
  maxAge: maxAgeMs,
});

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie("accessToken", accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
};

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(40),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerLocalUser(data);
    const tokens = issueTokens(user);

    setAuthCookies(res, tokens);
    res.status(201).json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await loginLocalUser(data);
    const tokens = issueTokens(user);

    setAuthCookies(res, tokens);
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const logout = (_req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ success: true });
};

export const logoutAll = async (req, res, next) => {
  try {
    await revokeAllSessions(req.user.id);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const me = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const payload = verifyRefreshToken(token);
    const user = await getUserById(payload.sub);

    if (!user || payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const tokens = issueTokens(user);
    setAuthCookies(res, tokens);
    res.status(200).json({ success: true, user });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
};

export const oauthCallback = (req, res) => {
  const tokens = issueTokens(req.user);
  setAuthCookies(res, tokens);
  res.redirect(`${env.frontendUrl}/dashboard`);
};
