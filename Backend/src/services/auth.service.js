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
  tokenVersion: user.tokenVersion,
});

export const issueTokens = (user) => {
  const accessToken = jwt.sign(
    { sub: user.id, tokenVersion: user.tokenVersion },
    env.jwtAccessSecret,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, tokenVersion: user.tokenVersion },
    env.jwtRefreshSecret,
    { expiresIn: "7d" }
  );

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
  const providerIdStr = String(providerId);

  // 1. Check if user exists with matching provider & providerId
  const existing = await prisma.user.findFirst({
    where: { provider, providerId: providerIdStr },
  });

  if (existing) {
    return publicUser(existing);
  }

  // 2. Check if user exists with matching email address
  if (email) {
    const userByEmail = await prisma.user.findUnique({ where: { email } });

    if (userByEmail) {
      const updated = await prisma.user.update({
        where: { id: userByEmail.id },
        data: {
          provider,
          providerId: providerIdStr,
          avatar: userByEmail.avatar || avatar,
        },
      });
      return publicUser(updated);
    }
  }

  // 3. Create new OAuth user
  const user = await prisma.user.create({
    data: {
      email,
      username: username || `${provider.toLowerCase()}_user`,
      avatar,
      provider,
      providerId: providerIdStr,
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
  return payload;
};

/*
  Access/refresh tokens are stateless JWTs with no revocation list,
  so there's no way to invalidate one before it expires - except by
  changing the value every valid token is checked against. Bumping
  this makes every previously issued token fail the tokenVersion
  check in auth.middleware.js / collaboration.socket.js on its next
  use, which is what "log out everywhere" actually means here.
*/
export const revokeAllSessions = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
};
