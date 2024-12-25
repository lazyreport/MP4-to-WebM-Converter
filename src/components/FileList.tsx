import { FileWithPath } from "../types";
import FileItem from "./Converter/FileItem";

interface FileListProps {
  files: FileWithPath[];
  onRemove: (index: number) => void;
}

const FileList = ({ files, onRemove }: FileListProps) =>
  files.length > 0 && (
    <div>
      <h2 className="text-lg font-semibold mb-2">Files to Convert</h2>
      <div className="space-y-2">
        {files.map((file, index) => (
          <FileItem key={index} file={file} onRemove={() => onRemove(index)} />
        ))}
      </div>
    </div>
  );

export default FileList;
