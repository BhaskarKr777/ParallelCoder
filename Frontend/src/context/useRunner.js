import { useEffect } from "react";
import socket from "../services/socket";
import useRunStore from "../store/runStore";

export const useRunner = () => {
  const startRun = useRunStore((state) => state.startRun);
  const appendOutput = useRunStore((state) => state.appendOutput);
  const finishRun = useRunStore((state) => state.finishRun);
  const setError = useRunStore((state) => state.setError);

  useEffect(() => {
    const onStart = ({ runId, initiatedBy }) => startRun(runId, initiatedBy);
    const onStdout = ({ runId, chunk }) => appendOutput(runId, "stdout", chunk);
    const onStderr = ({ runId, chunk }) => appendOutput(runId, "stderr", chunk);
    const onExit = ({ runId, ...exitInfo }) => finishRun(runId, exitInfo);
    const onError = ({ message }) => setError(message);

    socket.on("run:start", onStart);
    socket.on("run:stdout", onStdout);
    socket.on("run:stderr", onStderr);
    socket.on("run:exit", onExit);
    socket.on("run:error", onError);

    return () => {
      socket.off("run:start", onStart);
      socket.off("run:stdout", onStdout);
      socket.off("run:stderr", onStderr);
      socket.off("run:exit", onExit);
      socket.off("run:error", onError);
    };
  }, [startRun, appendOutput, finishRun, setError]);
};
