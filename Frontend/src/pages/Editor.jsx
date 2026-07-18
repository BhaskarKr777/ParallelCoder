import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ActivityBar from "../components/editor/ActivityBar";
import Explorer from "../components/editor/Explorer";
import EditorTabs from "../components/editor/EditorTabs";
import MonacoEditor from "../components/editor/MonacoEditor";
import CollaborationPanel from "../components/editor/CollaborationPanel";
import BottomPanel from "../components/editor/BottomPanel";
import Topbar from "../components/editor/Topbar";

import { useChat } from "../context/useChat";
import { usePresence } from "../context/usePresence";
import { filesApi } from "../services/api";

import socket from "../services/socket";

const Editor = () => {
  const { workspaceId } = useParams();

  usePresence(workspaceId);
  useChat();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  const [openTabs, setOpenTabs] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState(null);

  const [showExplorer, setShowExplorer] = useState(true);
  const [showCollab, setShowCollab] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    setIsLoadingFiles(true);

    filesApi
      .list(workspaceId)
      .then(({ project, files }) => {
        setProject(project);
        setFiles(files);
      })
      .finally(() => setIsLoadingFiles(false));
  }, [workspaceId]);

  const openFile = (file) => {
    const exists =
      openTabs.find(
        (tab) =>
          tab.id === file.id
      );

    if (exists) {
      setActiveTab(exists);
      return;
    }

    const updatedTabs = [
      ...openTabs,
      file,
    ];

    setOpenTabs(updatedTabs);
    setActiveTab(file);
  };

  const closeTab = (
    fileId
  ) => {
    const filtered =
      openTabs.filter(
        (tab) =>
          tab.id !== fileId
      );

    setOpenTabs(filtered);

    if (
      activeTab?.id ===
      fileId
    ) {
      setActiveTab(
        filtered[
        filtered.length - 1
        ] || null
      );
    }
  };

  const handleFileCreated = (file) => {
    setFiles((prev) => [...prev, file]);
  };

  const handleFileDeleted = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    closeTab(fileId);
  };

  const handleFileRenamed = (fileId, name) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name } : f))
    );

    setOpenTabs((prev) =>
      prev.map((t) => (t.id === fileId ? { ...t, name } : t))
    );

    setActiveTab((prev) =>
      prev?.id === fileId ? { ...prev, name } : prev
    );
  };

  useEffect(() => {
    if (!workspaceId)
      return;

    socket.emit(
      "editing-file",
      {
        workspaceId,
        file:
          activeTab?.name || null,
      }
    );
  }, [activeTab, workspaceId]);

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      {/* OUTER FRAME */}
      <div className="h-full p-5 bg-black">
        <div
          className="
            h-full
            rounded-[32px]
            border border-neutral-900
            bg-[#050505]
            overflow-hidden
            shadow-[0_0_80px_rgba(255,255,255,0.015)]
            flex
            flex-col
          "
        >
          {/* TOPBAR */}
          <Topbar />

          {/* MAIN */}
          <div className="flex flex-1 overflow-hidden p-3 gap-4 bg-[#050505]">
            {/* LEFT RAIL */}
            <div
              className="
                rounded-[28px]
                border border-neutral-900
                bg-[#090909]
                overflow-hidden
                flex
              "
            >
              <ActivityBar
                showExplorer={showExplorer}
                setShowExplorer={setShowExplorer}
                showCollab={showCollab}
                setShowCollab={setShowCollab}
              />

              {showExplorer && (
                <Explorer
                  workspaceId={workspaceId}
                  projectName={project?.name}
                  files={files}
                  isLoading={isLoadingFiles}
                  onFileOpen={openFile}
                  onFileCreated={handleFileCreated}
                  onFileDeleted={handleFileDeleted}
                  onFileRenamed={handleFileRenamed}
                />
              )}
            </div>

            {/* CENTER */}
            <div
              className="
                flex flex-col flex-1
                rounded-[28px]
                border border-neutral-900
                bg-[#090909]
                overflow-hidden
              "
            >
              <EditorTabs
                tabs={openTabs}
                activeTab={
                  activeTab
                }
                setActiveTab={
                  setActiveTab
                }
                closeTab={
                  closeTab
                }
              />

              <div className="flex-1 overflow-hidden">
                <MonacoEditor
                  activeTab={
                    activeTab
                  }
                />
              </div>

              <BottomPanel />
            </div>

            {/* RIGHT PANEL */}
            {showCollab && (
              <div
                className="
                  w-[340px]
                  h-full
                  min-h-0
                  rounded-[28px]
                  border border-neutral-900
                  bg-[#090909]
                  overflow-hidden
                  flex
                  flex-col
                "
              >
                <CollaborationPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
