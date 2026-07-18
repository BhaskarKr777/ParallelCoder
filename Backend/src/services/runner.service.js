import { spawn } from "child_process";
import { randomUUID } from "crypto";

/*
  Runs untrusted user code in a locked-down, throwaway Docker
  container. Nothing here should ever be relaxed without a very good
  reason:

  - --network none:      no outbound access at all (no exfiltration,
                          no hitting internal services/metadata APIs)
  - --read-only + a tiny
    noexec tmpfs:         nothing the code writes can persist or be
                          executed as a second-stage payload
  - --cap-drop ALL +
    no-new-privileges:    no privilege escalation inside the container
  - --user 1000:1000:     never runs as root
  - --pids-limit:         fork bombs can't exhaust host PIDs
  - --memory / --cpus:    one run can't starve the host or other runs
  - code goes over stdin, never as a CLI arg or into a shell string:
                          nothing to inject

  Only Node is supported for v1 (LANGUAGE_IMAGES has one entry) -
  intentionally not a generic "pick any image" surface.
*/

const LANGUAGE_IMAGES = {
  javascript: { image: "node:20-alpine", command: ["node"] },
};

const TIMEOUT_MS = 10_000;
const MAX_OUTPUT_BYTES = 64 * 1024;
const KILL_GRACE_MS = 2000;

export const isRunnableLanguage = (language) =>
  Object.prototype.hasOwnProperty.call(LANGUAGE_IMAGES, language);

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
    "128m",
    "--memory-swap",
    "128m",
    "--cpus",
    "0.5",
    "--pids-limit",
    "64",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=16m",
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
    proc.stderr.on("data", forward(onStderr));

    let forceKillTimer = null;

    const killContainer = () => {
      // `docker run -i --rm` exits once the container stops, but
      // stop it explicitly rather than relying on SIGTERM reaching
      // the CLI propagating cleanly through to the daemon. If even
      // that doesn't bring the local process down promptly, fall
      // back to SIGKILL-ing the CLI process itself.
      spawn("docker", ["kill", containerName]).on("error", () => {});
      forceKillTimer = setTimeout(() => proc.kill("SIGKILL"), KILL_GRACE_MS);
    };

    const timeout = setTimeout(() => {
      timedOut = true;
      killContainer();
    }, TIMEOUT_MS);

    proc.stdin.write(content ?? "");
    proc.stdin.end();

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (forceKillTimer) clearTimeout(forceKillTimer);
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
