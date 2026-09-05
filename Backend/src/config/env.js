import "dotenv/config";

const required = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
};

const UNSAFE_SECRETS = new Set([
  "dev_access_secret_change_me",
  "dev_refresh_secret_change_me",
  "change_me",
  "secret",
  "123456",
  "default",
]);

const isProduction = process.env.NODE_ENV === "production";

const validateProductionSecrets = (databaseUrl, jwtAccessSecret, jwtRefreshSecret) => {
  if (!isProduction) return;

  if (UNSAFE_SECRETS.has(jwtAccessSecret)) {
    throw new Error(
      `FATAL: Insecure JWT_ACCESS_SECRET ("${jwtAccessSecret}") cannot be used in production.`
    );
  }

  if (UNSAFE_SECRETS.has(jwtRefreshSecret)) {
    throw new Error(
      `FATAL: Insecure JWT_REFRESH_SECRET ("${jwtRefreshSecret}") cannot be used in production.`
    );
  }

  if (
    databaseUrl.includes("parallel_coder:parallel_coder") ||
    databaseUrl.includes("postgres:postgres@localhost")
  ) {
    throw new Error("FATAL: Insecure default database credentials cannot be used in production.");
  }
};

const databaseUrl = required("DATABASE_URL");
const jwtAccessSecret = required("JWT_ACCESS_SECRET");
const jwtRefreshSecret = required("JWT_REFRESH_SECRET");

validateProductionSecrets(databaseUrl, jwtAccessSecret, jwtRefreshSecret);

export const env = {
  isProduction,
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  frontendUrl: required("FRONTEND_URL"),
  databaseUrl,

  jwtAccessSecret,
  jwtRefreshSecret,

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "",
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    callbackUrl: process.env.GITHUB_CALLBACK_URL || "",
  },
};

