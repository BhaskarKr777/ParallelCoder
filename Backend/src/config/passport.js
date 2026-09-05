import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";

import { env } from "./env.js";
import { logger } from "./logger.js";
import { findOrCreateOAuthUser } from "../services/auth.service.js";

export const oauthAvailability = {
  google: Boolean(env.google.clientId && env.google.clientSecret),
  github: Boolean(env.github.clientId && env.github.clientSecret),
};

if (oauthAvailability.google) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl || `${env.frontendUrl}/api/auth/google/callback`,
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value || `google_${profile.id}@no-email.google.com`;
          const username =
            profile.displayName || profile.name?.givenName || "Google User";
          const avatar = profile.photos?.[0]?.value;

          const user = await findOrCreateOAuthUser({
            provider: "GOOGLE",
            providerId: profile.id,
            email,
            username,
            avatar,
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
} else {
  logger.warn("Google OAuth not configured — GOOGLE_CLIENT_ID/SECRET missing from .env");
}

if (oauthAvailability.github) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.github.clientId,
        clientSecret: env.github.clientSecret,
        callbackURL: env.github.callbackUrl || `${env.frontendUrl}/api/auth/github/callback`,
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value ||
            `${profile.username || profile.id}@users.noreply.github.com`;
          const username = profile.username || profile.displayName || "GitHub User";
          const avatar = profile.photos?.[0]?.value;

          const user = await findOrCreateOAuthUser({
            provider: "GITHUB",
            providerId: profile.id,
            email,
            username,
            avatar,
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
} else {
  logger.warn("GitHub OAuth not configured — GITHUB_CLIENT_ID/SECRET missing from .env");
}

export default passport;
