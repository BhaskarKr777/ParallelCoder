import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";

import { env } from "./env.js";
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
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: "GOOGLE",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            username: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Google OAuth not configured — GOOGLE_CLIENT_ID/SECRET missing from .env");
}

if (oauthAvailability.github) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.github.clientId,
        clientSecret: env.github.clientSecret,
        callbackURL: env.github.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: "GITHUB",
            providerId: profile.id,
            email:
              profile.emails?.[0]?.value ||
              `${profile.username}@users.noreply.github.com`,
            username: profile.username,
            avatar: profile.photos?.[0]?.value,
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
} else {
  console.warn("⚠️  GitHub OAuth not configured — GITHUB_CLIENT_ID/SECRET missing from .env");
}

export default passport;
