import React from "react";
import FileItem from "./FileItem";
import { workspaceFiles } from "../../data/mockWorkspace";

const FileTree = ({ onFileOpen }) => {
  return (
    <div className="mt-3">
      {workspaceFiles.map((item) => (
        <FileItem
          key={item.id}
          item={item}
          onFileOpen={onFileOpen}
        />
      ))}
    </div>
  );
};

export default FileTree;