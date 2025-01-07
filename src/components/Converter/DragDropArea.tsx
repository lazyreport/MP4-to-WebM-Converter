import { Upload } from "lucide-react";

interface DragDropProps {
  dragActive: boolean;
  converting: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: () => void;
}

export const DragDropArea = ({
  dragActive,
  converting,
  onDrag,
  onDrop,
  onFileSelect,
}: DragDropProps) => (
  <div
    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
      ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
      ${converting ? "opacity-50" : ""}`}
    onDragEnter={onDrag}
    onDragLeave={onDrag}
    onDragOver={onDrag}
    onDrop={onDrop}
  >
    <button onClick={onFileSelect} className="cursor-pointer w-full">
      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
      <p className="text-gray-600">Drop MP4 files here or click to select</p>
    </button>
  </div>
);
