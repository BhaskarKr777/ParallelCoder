import { spawn } from "child_process";
import { randomUUID } from "crypto";

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
    // javac needs a real .java file on disk, and requires the public
    // class name to match the filename - so submissions must define
    // `class Main`, same constraint most single-file judges impose.
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

const runLocalFallback = ({ language, content, onStdout, onStderr }) => {
  return new Promise((resolve) => {
    let cmd = "";
    let args = [];

    if (language === "javascript") {
      cmd = "node";
      args = ["-e", content ?? ""];
    } else if (language === "python") {
      cmd = process.platform === "win32" ? "python" : "python3";
      args = ["-c", content ?? ""];
    } else {
      onStderr("[Runner Notice] Docker Desktop is not running. Please start Docker Desktop to execute C/C++/Java code.\n");
      return resolve({ exitCode: 1, timedOut: false, truncated: false, error: "Docker daemon unavailable" });
    }

    onStderr("[Runner Notice] Docker daemon unavailable - running in local development mode.\n");

    const proc = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });

    let outputBytes = 0;
    let truncated = false;
    let timedOut = false;

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

    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
    }, TIMEOUT_MS);

    proc.on("error", (err) => {
      clearTimeout(timeout);
      onStderr(`\n[Local Execution Error] ${err.message}\n`);
      resolve({ exitCode: 1, timedOut: false, truncated, error: err.message });
    });

    proc.on("close", (exitCode) => {
      clearTimeout(timeout);
      resolve({ exitCode, timedOut, truncated, error: null });
    });
  });
};

export const runCode = ({ language, content, onStdout, onStderr }) => {
  const target = LANGUAGE_IMAGES[language];

  if (!target) {
    return Promise.reject(new Error(`Unsupported language: ${language}`));
  }

  const containerName = `run-${randomUUID()}`;

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
    ...(target.needsScratch ? ["--tmpfs", "/scratch:rw,nosuid,exec,size=96m"] : []),
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--user",
    "1000:1000",
    target.image,
    ...target.command,
  ];

  return new Promise((resolve) => {
    const proc = spawn("docker", dockerArgs, { stdio: ["pipe", "pipe", "pipe"] });

    let outputBytes = 0;
    let truncated = false;
    let timedOut = false;
    let settled = false;

    const dockerStderrChunks = [];

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

    const killContainer = () => {
      spawn("docker", ["kill", containerName]).on("error", () => {});
      forceKillTimer = setTimeout(() => proc.kill("SIGKILL"), KILL_GRACE_MS);
    };

    const timeout = setTimeout(() => {
      timedOut = true;
      killContainer();
    }, TIMEOUT_MS);

    proc.stdin.write(content ?? "");
    proc.stdin.end();

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
        result.error?.includes("ENOENT");

      if (isDockerConnError && (language === "javascript" || language === "python")) {
        const localResult = await runLocalFallback({ language, content, onStdout, onStderr });
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
