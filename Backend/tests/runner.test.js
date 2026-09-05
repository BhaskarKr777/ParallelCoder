import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { runCode, isRunnableLanguage } from "../src/services/runner.service.js";

const hasDocker = (() => {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

describe("runner.service", () => {
  it("only knows about supported languages", () => {
    expect(isRunnableLanguage("javascript")).toBe(true);
    expect(isRunnableLanguage("python")).toBe(true);
    expect(isRunnableLanguage("c")).toBe(true);
    expect(isRunnableLanguage("cpp")).toBe(true);
    expect(isRunnableLanguage("java")).toBe(true);
    expect(isRunnableLanguage("ruby")).toBe(false);
    expect(isRunnableLanguage(undefined)).toBe(false);
  });

  it.skipIf(!hasDocker)("executes code and streams stdout/stderr with the right exit code", async () => {
    const stdout = [];
    const stderr = [];

    const result = await runCode({
      language: "javascript",
      content: "console.log('out'); console.error('err'); process.exit(2);",
      onStdout: (chunk) => stdout.push(chunk),
      onStderr: (chunk) => stderr.push(chunk),
    });

    expect(stdout.join("")).toContain("out");
    expect(stderr.join("")).toContain("err");
    expect(result.exitCode).toBe(2);
    expect(result.timedOut).toBe(false);
  });

  it.skipIf(!hasDocker)("runs Python from stdin", async () => {
    const stdout = [];

    const result = await runCode({
      language: "python",
      content: "print('hello from python')",
      onStdout: (chunk) => stdout.push(chunk),
      onStderr: () => {},
    });

    expect(stdout.join("")).toContain("hello from python");
    expect(result.exitCode).toBe(0);
  }, 20000);

  it.skipIf(!hasDocker)("compiles and runs C in the exec-enabled scratch tmpfs", async () => {
    const stdout = [];
    const stderr = [];

    const result = await runCode({
      language: "c",
      content: `#include <stdio.h>\nint main(){ printf("hello from c\\n"); return 0; }`,
      onStdout: (chunk) => stdout.push(chunk),
      onStderr: (chunk) => stderr.push(chunk),
    });

    expect(stdout.join("")).toContain("hello from c");
    expect(stderr.join("")).toBe("");
    expect(result.exitCode).toBe(0);
  }, 20000);

  it.skipIf(!hasDocker)("compiles and runs C++ in the exec-enabled scratch tmpfs", async () => {
    const stdout = [];

    const result = await runCode({
      language: "cpp",
      content: `#include <iostream>\nint main(){ std::cout << "hello from cpp" << std::endl; return 0; }`,
      onStdout: (chunk) => stdout.push(chunk),
      onStderr: () => {},
    });

    expect(stdout.join("")).toContain("hello from cpp");
    expect(result.exitCode).toBe(0);
  }, 20000);

  it.skipIf(!hasDocker)("compiles and runs a Java submission (must define `class Main`)", async () => {
    const stdout = [];

    const result = await runCode({
      language: "java",
      content:
        'public class Main { public static void main(String[] args) { System.out.println("hello from java"); } }',
      onStdout: (chunk) => stdout.push(chunk),
      onStderr: () => {},
    });

    expect(stdout.join("")).toContain("hello from java");
    expect(result.exitCode).toBe(0);
  }, 20000);

  it.skipIf(!hasDocker)("has no network access from inside the sandbox", async () => {
    const stdout = [];

    const result = await runCode({
      language: "javascript",
      content: `
        const http = require('http');
        const req = http.get('http://example.com', () => {
          console.log('REACHED_NETWORK');
          process.exit(1);
        });
        req.on('error', () => {
          console.log('BLOCKED');
          process.exit(0);
        });
      `,
      onStdout: (chunk) => stdout.push(chunk),
      onStderr: () => {},
    });

    expect(stdout.join("")).not.toContain("REACHED_NETWORK");
    expect(result.exitCode).not.toBe(1);
  }, 15000);

  it("rejects an unsupported language before spawning anything", async () => {
    await expect(
      runCode({ language: "ruby", content: "puts 1", onStdout: () => {}, onStderr: () => {} })
    ).rejects.toThrow("Unsupported language");
  });
});
