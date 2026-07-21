import pino from "pino";

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isTest ? "silent" : isProd ? "info" : "debug"),
  // JSON lines in production (what log aggregators expect); a
  // human-readable transport locally instead of raw JSON per line.
  // Neither in tests - vitest sets NODE_ENV=test, and a request log
  // line per assertion is pure noise there.
  transport:
    isProd || isTest
      ? undefined
      : {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        },
});
