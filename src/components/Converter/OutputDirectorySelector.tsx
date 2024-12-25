import { Folder } from "lucide-react";

interface OutputDirectorySelectorProps {
  value: string;
  onClick: () => void;
}

const OutputDirectorySelector = ({
  value,
  onClick,
}: OutputDirectorySelectorProps) => (
  <div>
    <label className="block text-sm font-medium mb-1">Output Location</label>
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={value}
        readOnly
        placeholder="Select output directory..."
        className="flex-1 p-2 border rounded bg-white"
      />
      <button
        onClick={onClick}
        className="p-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        <Folder size={20} />
      </button>
    </div>
  </div>
);

export default OutputDirectorySelector;
