import { Film } from "lucide-react";
import { FileWithPath } from "../../types";

interface FileItemProps {
  file: FileWithPath;
  onRemove: () => void;
}

const FileItem = ({ file, onRemove }: FileItemProps) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
    <div className="flex items-center overflow-hidden">
      <Film className="mr-2 flex-shrink-0" size={20} />
      <span className="truncate">{file.name}</span>
    </div>
    <button
      onClick={onRemove}
      className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
    >
      Remove
    </button>
  </div>
);

export default FileItem;
