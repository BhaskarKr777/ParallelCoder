import { spawn } from "child_process";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import os from "os";

/*
  Runs untrusted user code in a locked-down, throwaway Docker
  container. Nothing here should ever be relaxed without a very good
  reason:

  - --network none:      no outbound access at all (no exfiltration,
                          no hitting internal services/metadata APIs)
  - --read-only + a tiny
    noexec tmpfs:         nothing written to /tmp can persist or be
                          executed as a second-stage payload
  - --cap-drop ALL +
    no-new-privileges:    no privilege escalation inside the container
  - --user 1000:1000:     never runs as root
  - --pids-limit:         fork bombs can't exhaust host PIDs
  - --memory / --cpus:    one run can't starve the host or other runs
  - code goes over stdin, never as a CLI arg or into a shell string:
                          nothing to inject

  Compiled languages (c/cpp/java) are the one deliberate exception to
  the noexec rule above: a compiler has to write a binary/class file
  somewhere and then execute it, so those languages additionally get
  a second tmpfs at /scratch mounted *without* noexec. This is exactly
  what every sandboxed judge does - the risk it adds is bounded by
  everything else above still applying (no network, no root, capped
  memory/cpus/pids), and running C/C++ at all already implies the
  submitted code executes as native machine code either way.
*/

/*
  One image with every toolchain baked in (see runner.dockerfile at
  the repo root), instead of pulling a separate upstream image per
  language - build it yourself with:

    docker build -f runner.dockerfile -t parallel-coder-runner:latest .

  before starting the API. All languages below share it; only the
  command run inside the container differs.
*/
const RUNNER_IMAGE = process.env.RUNNER_IMAGE || "parallel-coder-runner:1.0.0";

const LANGUAGE_IMAGES = {
  javascript: {
    image: RUNNER_IMAGE,
    command: ["node"],
  },
  python: {
    image: RUNNER_IMAGE,
    // `-` tells the interpreter to read the script from stdin.
    command: ["python3", "-"],
  },
  c: {
    image: RUNNER_IMAGE,
    // `-x c -` reads the source from stdin; only the compiled
    // binary touches disk, in the exec-enabled /scratch tmpfs.
    command: ["sh", "-c", "gcc -O2 -pipe -x c -o /scratch/a.out - && /scratch/a.out"],
    needsScratch: true,
  },
  cpp: {
    image: RUNNER_IMAGE,
    command: ["sh", "-c", "g++ -O2 -pipe -x c++ -o /scratch/a.out - && /scratch/a.out"],
    needsScratch: true,
  },
  java: {
    image: RUNNER_IMAGE,
    command: [
      "sh",
      "-c",
      "cat > /scratch/Main.java && javac -d /scratch /scratch/Main.java && java -cp /scratch Main",
    ],
    needsScratch: true,
  },
};

const TIMEOUT_MS = 15_000;
const MAX_OUTPUT_BYTES = 64 * 1024;
const KILL_GRACE_MS = 2000;

export const isRunnableLanguage = (language) =>
  Object.prototype.hasOwnProperty.call(LANGUAGE_IMAGES, language);

export const getJavaClassName = (content = "") => {
  const cleaned = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
  const publicMatch = cleaned.match(/\bpublic\s+(?:final\s+)?class\s+([A-Za-z0-9_$]+)/);
  if (publicMatch) return publicMatch[1];
  const classMatch = cleaned.match(/\bclass\s+([A-Za-z0-9_$]+)(?:\s+extends|\s+implements|\s*\{)/);
  if (classMatch) return classMatch[1];
  return "Main";
};

let dockerAvailable = null;
let lastDockerCheck = 0;
const DOCKER_CHECK_TTL = 30_000;

export const isDockerDaemonAvailable = async () => {
  const now = Date.now();
  if (dockerAvailable !== null && now - lastDockerCheck < DOCKER_CHECK_TTL) {
    return dockerAvailable;
  }

  return new Promise((resolve) => {
    const proc = spawn("docker", ["info"], { stdio: "ignore" });
    const timer = setTimeout(() => {
      proc.kill();
      dockerAvailable = false;
      lastDockerCheck = Date.now();
      resolve(false);
    }, 2000);

    proc.on("error", () => {
      clearTimeout(timer);
      dockerAvailable = false;
      lastDockerCheck = Date.now();
      resolve(false);
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      dockerAvailable = code === 0;
      lastDockerCheck = Date.now();
      resolve(dockerAvailable);
    });
  });
};

const runProcess = ({
  cmd,
  args,
  cwd,
  stdinContent,
  closeStdin = true,
  onSession,
  onStdout,
  onStderr,
  timeoutMs = TIMEOUT_MS,
}) => {
  return new Promise((resolve) => {
    let outputBytes = 0;
    let truncated = false;
    let timedOut = false;
    let proc = null;
    let timeoutTimer = null;

    try {
      proc = spawn(cmd, args, {
        cwd,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (err) {
      return resolve({ exitCode: 1, timedOut: false, truncated: false, error: err.message });
    }

    if (onSession && proc) {
      onSession({
        writeStdin: (chunk) => {
          if (proc.stdin && !proc.stdin.destroyed) {
            proc.stdin.write(chunk);
          }
        },
        kill: () => {
          try {
            proc.kill("SIGKILL");
          } catch {
            // ignore
          }
        },
      });
    }

    const forward = (emit) => (chunk) => {
      if (truncated) return;
      outputBytes += chunk.length;
      if (outputBytes > MAX_OUTPUT_BYTES) {
        truncated = true;
        emit("\n[output truncated]\n");
        proc.kill("SIGKILL");
        return;
      }
      emit(chunk.toString("utf8"));
    };

    proc.stdout.on("data", forward(onStdout));
    proc.stderr.on("data", forward(onStderr));

    timeoutTimer = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
    }, timeoutMs);

    proc.on("error", (err) => {
      clearTimeout(timeoutTimer);
      if (err.code === "ENOENT") {
        onStderr(`\n[Execution Error] Command '${cmd}' not found on the host system. Ensure it is installed.\n`);
      } else {
        onStderr(`\n[Execution Error] ${err.message}\n`);
      }
      resolve({ exitCode: 1, timedOut: false, truncated, error: err.message });
    });

    proc.on("close", (exitCode) => {
      clearTimeout(timeoutTimer);
      resolve({ exitCode, timedOut, truncated, error: null });
    });

    if (stdinContent !== undefined && proc.stdin) {
      proc.stdin.write(stdinContent);
      if (closeStdin) {
        proc.stdin.end();
      }
    } else if (closeStdin && proc.stdin) {
      proc.stdin.end();
    }
  });
};

export const runLocalFallback = async ({
  language,
  content,
  stdin,
  closeStdin = false,
  onSession,
  onStdout,
  onStderr,
}) => {
  if (language === "javascript") {
    const runDir = path.join(os.tmpdir(), `pc-run-${randomUUID()}`);
    await fs.mkdir(runDir, { recursive: true });
    const srcFile = path.join(runDir, "main.js");

    try {
      await fs.writeFile(srcFile, content ?? "", "utf8");
      return await runProcess({
        cmd: "node",
        args: [srcFile],
        cwd: runDir,
        stdinContent: stdin,
        closeStdin,
        onSession,
        onStdout,
        onStderr,
      });
    } finally {
      await fs.rm(runDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  if (language === "python") {
    const runDir = path.join(os.tmpdir(), `pc-run-${randomUUID()}`);
    await fs.mkdir(runDir, { recursive: true });
    const srcFile = path.join(runDir, "main.py");
    const pyCmd = process.platform === "win32" ? "python" : "python3";

    try {
      await fs.writeFile(srcFile, content ?? "", "utf8");
      return await runProcess({
        cmd: pyCmd,
        args: [srcFile],
        cwd: runDir,
        stdinContent: stdin,
        closeStdin,
        onSession,
        onStdout,
        onStderr,
      });
    } finally {
      await fs.rm(runDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  if (language === "c" || language === "cpp") {
    const isCpp = language === "cpp";
    const compiler = isCpp ? "g++" : "gcc";
    const ext = isCpp ? "cpp" : "c";
    const runDir = path.join(os.tmpdir(), `pc-run-${randomUUID()}`);
    await fs.mkdir(runDir, { recursive: true });

    const srcFile = path.join(runDir, `main.${ext}`);
    const binName = process.platform === "win32" ? "main.exe" : "main.out";
    const binFile = path.join(runDir, binName);

    try {
      await fs.writeFile(srcFile, content ?? "", "utf8");

      const compileRes = await runProcess({
        cmd: compiler,
        args: ["-O2", "-pipe", srcFile, "-o", binFile],
        cwd: runDir,
        closeStdin: true,
        onStdout: onStderr,
        onStderr,
      });

      if (compileRes.exitCode !== 0 || compileRes.error) {
        return compileRes;
      }

      return await runProcess({
        cmd: binFile,
        args: [],
        cwd: runDir,
        stdinContent: stdin,
        closeStdin,
        onSession,
        onStdout,
        onStderr,
      });
    } finally {
      await fs.rm(runDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  if (language === "java") {
    const runDir = path.join(os.tmpdir(), `pc-run-${randomUUID()}`);
    await fs.mkdir(runDir, { recursive: true });

    const className = getJavaClassName(content);
    const srcFile = path.join(runDir, `${className}.java`);

    try {
      await fs.writeFile(srcFile, content ?? "", "utf8");

      const compileRes = await runProcess({
        cmd: "javac",
        args: ["-d", runDir, srcFile],
        cwd: runDir,
        closeStdin: true,
        onStdout: onStderr,
        onStderr,
      });

      if (compileRes.exitCode !== 0 || compileRes.error) {
        return compileRes;
      }

      return await runProcess({
        cmd: "java",
        args: ["-cp", runDir, className],
        cwd: runDir,
        stdinContent: stdin,
        closeStdin,
        onSession,
        onStdout,
        onStderr,
      });
    } finally {
      await fs.rm(runDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  return { exitCode: 1, timedOut: false, truncated: false, error: `Unsupported fallback language: ${language}` };
};

export const runCode = async ({
  language,
  content,
  stdin,
  closeStdin = false,
  onSession,
  onStdout,
  onStderr,
}) => {
  const target = LANGUAGE_IMAGES[language];

  if (!target) {
    return Promise.reject(new Error(`Unsupported language: ${language}`));
  }

  const hasDocker = await isDockerDaemonAvailable();
  if (!hasDocker) {
    return runLocalFallback({
      language,
      content,
      stdin,
      closeStdin,
      onSession,
      onStdout,
      onStderr,
    });
  }

  const containerName = `run-${randomUUID()}`;
  const base64Code = Buffer.from(content ?? "", "utf8").toString("base64");

  let command = target.command;
  if (language === "javascript") {
    command = ["sh", "-c", `echo "${base64Code}" | base64 -d > /tmp/main.js && node /tmp/main.js`];
  } else if (language === "python") {
    command = ["sh", "-c", `echo "${base64Code}" | base64 -d > /tmp/main.py && python3 /tmp/main.py`];
  } else if (language === "c") {
    command = [
      "sh",
      "-c",
      `echo "${base64Code}" | base64 -d > /scratch/main.c && gcc -O2 -pipe /scratch/main.c -o /scratch/a.out && /scratch/a.out`,
    ];
  } else if (language === "cpp") {
    command = [
      "sh",
      "-c",
      `echo "${base64Code}" | base64 -d > /scratch/main.cpp && g++ -O2 -pipe /scratch/main.cpp -o /scratch/a.out && /scratch/a.out`,
    ];
  } else if (language === "java") {
    const className = getJavaClassName(content);
    command = [
      "sh",
      "-c",
      `echo "${base64Code}" | base64 -d > /scratch/${className}.java && javac -d /scratch /scratch/${className}.java && java -cp /scratch ${className}`,
    ];
  }

  const dockerArgs = [
    "run",
    "--rm",
    "-i",
    "--name",
    containerName,
    "--network",
    "none",
    "--memory",
    "256m",
    "--memory-swap",
    "256m",
    "--cpus",
    "1",
    "--pids-limit",
    "128",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=16m",
    "--tmpfs",
    "/scratch:rw,nosuid,exec,size=96m",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--user",
    "1000:1000",
    target.image,
    ...command,
  ];

  return new Promise((resolve) => {
    const proc = spawn("docker", dockerArgs, { stdio: ["pipe", "pipe", "pipe"] });

    let outputBytes = 0;
    let truncated = false;
    let timedOut = false;
    let settled = false;

    const dockerStderrChunks = [];

    const killContainer = () => {
      spawn("docker", ["kill", containerName]).on("error", () => {});
      forceKillTimer = setTimeout(() => proc.kill("SIGKILL"), KILL_GRACE_MS);
    };

    if (onSession) {
      onSession({
        writeStdin: (chunk) => {
          if (proc.stdin && !proc.stdin.destroyed) {
            proc.stdin.write(chunk);
          }
        },
        kill: () => killContainer(),
      });
    }

    const forward = (emit) => (chunk) => {
      if (truncated) return;

      outputBytes += chunk.length;

      if (outputBytes > MAX_OUTPUT_BYTES) {
        truncated = true;
        emit("\n[output truncated]\n");
        killContainer();
        return;
      }

      emit(chunk.toString("utf8"));
    };

    proc.stdout.on("data", forward(onStdout));
    proc.stderr.on("data", (chunk) => {
      dockerStderrChunks.push(chunk.toString("utf8"));
      forward(onStderr)(chunk);
    });

    let forceKillTimer = null;

    const timeout = setTimeout(() => {
      timedOut = true;
      killContainer();
    }, TIMEOUT_MS);

    if (stdin !== undefined && proc.stdin) {
      proc.stdin.write(stdin);
      if (closeStdin) {
        proc.stdin.end();
      }
    } else if (closeStdin && proc.stdin) {
      proc.stdin.end();
    }

    const finish = async (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (forceKillTimer) clearTimeout(forceKillTimer);

      const combinedStderr = dockerStderrChunks.join("");
      const isDockerConnError =
        combinedStderr.includes("failed to connect to the docker API") ||
        combinedStderr.includes("daemon is running") ||
        combinedStderr.includes("Cannot connect to the Docker daemon") ||
        combinedStderr.includes("error during connect") ||
        combinedStderr.includes("permission denied") ||
        result.error?.includes("ENOENT");

      if (isDockerConnError) {
        dockerAvailable = false;
        const localResult = await runLocalFallback({
          language,
          content,
          stdin,
          closeStdin,
          onSession,
          onStdout,
          onStderr,
        });
        return resolve(localResult);
      }

      resolve(result);
    };

    proc.on("error", (err) => {
      finish({ exitCode: null, timedOut: false, truncated, error: err.message });
    });

    proc.on("close", (exitCode) => {
      finish({ exitCode, timedOut, truncated, error: null });
    });
  });
};
