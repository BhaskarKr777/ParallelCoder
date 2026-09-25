import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

describe("Root Repository Health & Configuration Tests", () => {
  it("should have valid root package.json configuration", () => {
    const pkgPath = path.join(process.cwd(), "package.json");
    assert.strictEqual(fs.existsSync(pkgPath), true);

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    assert.strictEqual(pkg.name, "parallel-coder");
    assert.ok(pkg.scripts);
    assert.ok(pkg.scripts.test);
    assert.ok(pkg.scripts.build);
  });

  it("should have essential project files present", () => {
    const requiredFiles = [
      "README.md",
      "LICENSE",
      "SECURITY.md",
      "CONTRIBUTING.md",
      "CODE_OF_CONDUCT.md",
      "docker-compose.yml",
      "dockerfile",
      "runner.dockerfile",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      assert.strictEqual(fs.existsSync(filePath), true, `Missing required file: ${file}`);
    }
  });

  it("should have valid .github security & community templates", () => {
    const githubFiles = [
      ".github/dependabot.yml",
      ".github/workflows/ci.yml",
      ".github/ISSUE_TEMPLATE/bug_report.md",
      ".github/ISSUE_TEMPLATE/feature_request.md",
      ".github/PULL_REQUEST_TEMPLATE.md",
    ];

    for (const file of githubFiles) {
      const filePath = path.join(process.cwd(), file);
      assert.strictEqual(fs.existsSync(filePath), true, `Missing GitHub template: ${file}`);
    }
  });
});
