import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";

const FileItem = ({
  item,
  level = 0,
  onFileOpen,
}) => {
  const [expanded, setExpanded] = useState(true);

  const isFolder = item.type === "folder";

  const handleClick = () => {
    if (isFolder) {
      setExpanded(!expanded);
    } else {
      onFileOpen(item);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 cursor-pointer transition rounded-md"
        style={{
          paddingLeft: `${level * 14 + 12}px`,
        }}
      >
        {isFolder ? (
          <>
            {expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}

            {expanded ? (
              <FolderOpen size={16} />
            ) : (
              <Folder size={16} />
            )}
          </>
        ) : (
          <>
            <div className="w-[14px]" />
            <FileText size={15} />
          </>
        )}

        <span>{item.name}</span>
      </div>

      {expanded &&
        isFolder &&
        item.children?.map((child) => (
          <FileItem
            key={child.id}
            item={child}
            level={level + 1}
            onFileOpen={onFileOpen}
          />
        ))}
    </div>
  );
};

export default FileItem;