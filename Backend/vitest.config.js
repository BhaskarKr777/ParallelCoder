import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    // Tests share one real Postgres database; running files in
    // parallel would race migrations/connections against each
    // other for no real speed win at this test count.
    fileParallelism: false,
    testTimeout: 15000,
  },
});
