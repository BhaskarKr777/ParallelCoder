import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import useRunStore from "../../store/runStore";

const statusText = ({ isRunning, exitInfo, errorMessage, initiatedBy }) => {
  if (errorMessage) return `Error: ${errorMessage}`;
  if (isRunning) return `Running${initiatedBy ? ` (started by ${initiatedBy})` : ""}...`;
  if (!exitInfo) return "Output";

  if (exitInfo.error) return `Error: ${exitInfo.error}`;
  if (exitInfo.timedOut) return "Timed out after 10s";
  return `Exited with code ${exitInfo.exitCode}${exitInfo.truncated ? " (output truncated)" : ""}`;
};

const BottomPanel = () => {
  const isRunning = useRunStore((state) => state.isRunning);
  const runId = useRunStore((state) => state.runId);
  const initiatedBy = useRunStore((state) => state.initiatedBy);
  const output = useRunStore((state) => state.output);
  const exitInfo = useRunStore((state) => state.exitInfo);
  const errorMessage = useRunStore((state) => state.errorMessage);
  const clear = useRunStore((state) => state.clear);

  const [expanded, setExpanded] = useState(false);
  const outputRef = useRef(null);

  useEffect(() => {
    if (isRunning) setExpanded(true);
  }, [isRunning, runId]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [output]);

  const hasContent = output.length > 0 || isRunning || !!errorMessage;

  return (
    <div className="border-t border-zinc-800 bg-black">
      {expanded && hasContent && (
        <div className="flex flex-col" style={{ height: 220 }}>
          <div className="h-9 flex items-center justify-between px-4 border-b border-zinc-900 text-xs text-zinc-400 shrink-0">
            <span className={errorMessage || exitInfo?.error ? "text-red-400" : ""}>
              {statusText({ isRunning, exitInfo, errorMessage, initiatedBy })}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={clear}
                title="Clear output"
                className="p-1 rounded hover:bg-zinc-900 hover:text-white transition"
              >
                <X size={14} />
              </button>

              <button
                onClick={() => setExpanded(false)}
                title="Collapse"
                className="p-1 rounded hover:bg-zinc-900 hover:text-white transition"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div
            ref={outputRef}
            className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap"
          >
            {output.map((line) => (
              <span
                key={line.id}
                className={line.stream === "stderr" ? "text-red-400" : "text-zinc-200"}
              >
                {line.text}
              </span>
            ))}

            {output.length === 0 && isRunning && (
              <span className="text-zinc-600">Waiting for output...</span>
            )}
          </div>
        </div>
      )}

      <div className="h-10 flex items-center justify-between px-4 text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <span>main</span>
          <span>JavaScript</span>
          <span>UTF-8</span>
        </div>

        <div className="flex items-center gap-4">
          {hasContent && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <ChevronUp size={14} />
              {statusText({ isRunning, exitInfo, errorMessage, initiatedBy })}
            </button>
          )}

          <span>Realtime Connected</span>
          <span>Workspace: Active</span>
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;
