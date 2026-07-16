import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../config/prisma.js";
import { env } from "../config/env.js";

const SALT_ROUNDS = 12;

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  avatar: user.avatar,
  provider: user.provider,
});

export const issueTokens = (user) => {
  const accessToken = jwt.sign({ sub: user.id }, env.jwtAccessSecret, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ sub: user.id }, env.jwtRefreshSecret, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const registerLocalUser = async ({ email, username, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const error = new Error("An account with this email already exists");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      provider: "LOCAL",
    },
  });

  return publicUser(user);
};

export const loginLocalUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return publicUser(user);
};

export const findOrCreateOAuthUser = async ({
  provider,
  providerId,
  email,
  username,
  avatar,
}) => {
  const existing = await prisma.user.findFirst({
    where: { provider, providerId },
  });

  if (existing) {
    return publicUser(existing);
  }

  const emailTaken = await prisma.user.findUnique({ where: { email } });

  if (emailTaken) {
    const error = new Error(
      `This email is already registered via ${emailTaken.provider}. Sign in with that method instead.`
    );
    error.status = 409;
    throw error;
  }

  const user = await prisma.user.create({
    data: {
      email,
      username,
      avatar,
      provider,
      providerId,
    },
  });

  return publicUser(user);
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });

  return user ? publicUser(user) : null;
};

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, env.jwtRefreshSecret);
  return payload.sub;
};
