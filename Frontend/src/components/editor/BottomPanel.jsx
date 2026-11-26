import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, X, Terminal, Sliders, Square, CornerDownLeft, Trash2, Eye } from "lucide-react";

import socket from "../../services/socket";
import useRunStore from "../../store/runStore";
import usePreviewStore from "../../store/previewStore";

const statusText = ({ isRunning, exitInfo, errorMessage, initiatedBy }) => {
  if (errorMessage) return `Error: ${errorMessage}`;
  if (isRunning) return `Running${initiatedBy ? ` (${initiatedBy})` : ""}...`;
  if (!exitInfo) return "Idle";

  if (exitInfo.error) return `Error: ${exitInfo.error}`;
  if (exitInfo.timedOut) return "Timed out after 15s";
  return `Exited with code ${exitInfo.exitCode}${exitInfo.truncated ? " (output truncated)" : ""}`;
};

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  python: "Python",
  c: "C",
  cpp: "C++",
  java: "Java",
  typescript: "TypeScript",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  markdown: "Markdown",
};

const BottomPanel = ({ language }) => {
  const isRunning = useRunStore((state) => state.isRunning);
  const runId = useRunStore((state) => state.runId);
  const initiatedBy = useRunStore((state) => state.initiatedBy);
  const output = useRunStore((state) => state.output);
  const exitInfo = useRunStore((state) => state.exitInfo);
  const errorMessage = useRunStore((state) => state.errorMessage);
  const customInput = useRunStore((state) => state.customInput);
  const setCustomInput = useRunStore((state) => state.setCustomInput);
  const activeTab = useRunStore((state) => state.activeTab);
  const setActiveTab = useRunStore((state) => state.setActiveTab);
  const clear = useRunStore((state) => state.clear);

  const previewFileName = usePreviewStore((state) => state.fileName);
  const previewHtml = usePreviewStore((state) => state.html);
  const closePreview = usePreviewStore((state) => state.closePreview);
  const isPreviewing = previewHtml !== null;

  const [expanded, setExpanded] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const outputRef = useRef(null);
  const terminalInputRef = useRef(null);

  useEffect(() => {
    if (isRunning) setExpanded(true);
  }, [isRunning, runId]);

  useEffect(() => {
    if (isPreviewing) setExpanded(true);
  }, [isPreviewing, previewFileName]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [output]);

  const statusLabel = isPreviewing
    ? `Preview: ${previewFileName}`
    : statusText({ isRunning, exitInfo, errorMessage, initiatedBy });

  const handleSendStdin = (e) => {
    e?.preventDefault();
    if (!isRunning || !runId) return;

    const chunk = `${terminalInput}\n`;
    socket.emit("run:stdin", { runId, chunk });
    setTerminalInput("");
  };

  const handleStopRun = () => {
    if (!isRunning || !runId) return;
    socket.emit("run:stop", { runId });
  };

  const handleClose = () => {
    if (isPreviewing) {
      closePreview();
      return;
    }
    clear();
  };

  return (
    <div className="border-t border-zinc-800 bg-[#09090b]">
      {expanded && (
        <div className="flex flex-col" style={{ height: isPreviewing ? 420 : 250 }}>
          {/* Header Bar */}
          <div className="h-9 flex items-center justify-between px-3 border-b border-zinc-800/80 bg-zinc-950/80 text-xs text-zinc-400 shrink-0 select-none">
            {/* Tabs */}
            <div className="flex items-center gap-1.5">
              {isPreviewing ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 text-white font-medium">
                  <Eye size={13} className="text-blue-400" />
                  <span>Preview: {previewFileName}</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab("terminal")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium ${
                      activeTab === "terminal"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    }`}
                  >
                    <Terminal size={13} className={isRunning ? "text-emerald-400 animate-pulse" : "text-zinc-400"} />
                    <span>Terminal</span>
                    {isRunning && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("input")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium ${
                      activeTab === "input"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    }`}
                  >
                    <Sliders size={13} className={customInput.trim() ? "text-amber-400" : "text-zinc-400"} />
                    <span>Custom Input (stdin)</span>
                    {customInput.trim() && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-0.5" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Status and Action Buttons */}
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] truncate max-w-[240px] ${
                  !isPreviewing && (errorMessage || exitInfo?.error)
                    ? "text-red-400 font-medium"
                    : isRunning
                    ? "text-emerald-400 font-medium"
                    : "text-zinc-500"
                }`}
              >
                {statusLabel}
              </span>

              {isRunning && (
                <button
                  onClick={handleStopRun}
                  title="Stop execution"
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[11px] font-semibold transition"
                >
                  <Square size={11} className="fill-red-400" />
                  <span>Stop</span>
                </button>
              )}

              {!isPreviewing && (
                <button
                  onClick={handleClose}
                  title="Clear output"
                  className="p-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
                >
                  <Trash2 size={13} />
                </button>
              )}

              {isPreviewing && (
                <button
                  onClick={closePreview}
                  title="Close preview"
                  className="p-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
                >
                  <X size={14} />
                </button>
              )}

              <button
                onClick={() => setExpanded(false)}
                title="Collapse"
                className="p-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Panel Body */}
          {isPreviewing ? (
            <iframe
              srcDoc={previewHtml}
              title={previewFileName}
              sandbox="allow-scripts"
              className="flex-1 w-full bg-white"
            />
          ) : activeTab === "input" ? (
            /* Custom Input Tab for DSA problem testcases */
            <div className="flex-1 flex flex-col bg-[#050505] p-3 text-xs">
              <div className="flex items-center justify-between pb-2 text-[11px] text-zinc-400 border-b border-zinc-900">
                <span>
                  Provide input data passed via <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">stdin</code> to your code (<code className="text-amber-300">Scanner</code> in Java, <code className="text-amber-300">cin</code> in C++, <code className="text-amber-300">scanf</code> in C, <code className="text-amber-300">input()</code> in Python).
                </span>
                {customInput && (
                  <button
                    onClick={() => setCustomInput("")}
                    className="text-zinc-500 hover:text-zinc-300 transition text-[11px]"
                  >
                    Clear Input
                  </button>
                )}
              </div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={`Paste your DSA test cases here...\nExample:\n5\n10 20 30 40 50`}
                className="flex-1 w-full bg-transparent font-mono text-xs leading-relaxed text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none pt-2"
                spellCheck={false}
              />
            </div>
          ) : (
            /* Terminal Output + Live Interactive Stdin Tab */
            <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
              <div
                ref={outputRef}
                className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text"
              >
                {output.map((line) => (
                  <span
                    key={line.id}
                    className={
                      line.isInput
                        ? "text-emerald-400 font-semibold"
                        : line.stream === "stderr"
                        ? "text-red-400"
                        : "text-zinc-200"
                    }
                  >
                    {line.text}
                  </span>
                ))}

                {output.length === 0 && isRunning && (
                  <span className="text-zinc-600">Executing... (use interactive prompt below if waiting for input)</span>
                )}

                {output.length === 0 && !isRunning && (
                  <span className="text-zinc-600">No output yet. Click 'Run' to compile and execute.</span>
                )}
              </div>

              {/* Interactive Stdin Prompt */}
              <form
                onSubmit={handleSendStdin}
                className="h-8 border-t border-zinc-900/90 bg-zinc-950/70 flex items-center px-3 gap-2"
              >
                <span className="font-mono text-xs text-emerald-400 font-bold select-none">&gt;</span>
                <input
                  ref={terminalInputRef}
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder={
                    isRunning
                      ? "Interactive input for Scanner / cin / input() - press Enter to send"
                      : "Program is not running. Paste input in 'Custom Input (stdin)' tab or click Run."
                  }
                  disabled={!isRunning}
                  className="flex-1 bg-transparent font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none disabled:opacity-50"
                />
                {isRunning && (
                  <button
                    type="submit"
                    disabled={!terminalInput.trim()}
                    title="Send to stdin"
                    className="p-1 rounded text-zinc-400 hover:text-emerald-400 disabled:opacity-30 transition"
                  >
                    <CornerDownLeft size={13} />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="h-9 flex items-center justify-between px-4 text-xs text-zinc-400 select-none">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] text-zinc-500">main</span>
          <span className="font-mono text-[11px] text-zinc-400">{LANGUAGE_LABELS[language] || "Plain Text"}</span>
          <span className="font-mono text-[11px] text-zinc-500">UTF-8</span>
        </div>

        <div className="flex items-center gap-4">
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1.5 hover:text-white transition font-mono text-[11px]"
            >
              <ChevronUp size={13} />
              <span>{statusLabel}</span>
              {customInput.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Custom input set" />
              )}
            </button>
          )}

          <span className="text-[11px] text-zinc-500">Realtime Connected</span>
          <span className="text-[11px] text-emerald-500/80">● Active</span>
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;
