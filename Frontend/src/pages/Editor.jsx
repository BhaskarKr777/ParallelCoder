import {
  useState,
  useEffect,
} from "react";

import ActivityBar from "../components/editor/ActivityBar";
import Explorer from "../components/editor/Explorer";
import EditorTabs from "../components/editor/EditorTabs";
import MonacoEditor from "../components/editor/MonacoEditor";
import CollaborationPanel from "../components/editor/CollaborationPanel";
import BottomPanel from "../components/editor/BottomPanel";
import Topbar from "../components/editor/Topbar";

import { workspaceFiles } from "../data/mockWorkspace";
import { usePresence } from "../context/usePresence";

import socket from "../services/socket";

const Editor = () => {
  usePresence();

  const [openTabs, setOpenTabs] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState(null);

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

  useEffect(() => {
    if (!activeTab)
      return;

    socket.emit(
      "editing-file",
      {
        workspaceId:
          "parallel-workspace",
        file:
          activeTab.name,
      }
    );
  }, [activeTab]);

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
              <ActivityBar />

              <Explorer
                files={
                  workspaceFiles
                }
                onFileOpen={
                  openFile
                }
              />
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
            <div
              className="
                w-[340px]
                rounded-[28px]
                border border-neutral-900
                bg-[#090909]
                overflow-hidden
              "
            >
              <CollaborationPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;