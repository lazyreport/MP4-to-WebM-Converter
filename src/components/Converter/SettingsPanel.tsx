import { Settings } from "lucide-react";
import OutputDirectorySelector from "./OutputDirectorySelector";
import QualitySelector from "./QualitySelector";

interface SettingsPanelProps {
  outputDir: string;
  settings: { quality: string };
  onDirectorySelect: () => void;
  onQualityChange: (settings: { quality: string }) => void;
}

export const SettingsPanel = ({
  outputDir,
  settings,
  onDirectorySelect,
  onQualityChange,
}: SettingsPanelProps) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center mb-4">
      <Settings className="mr-2" size={20} />
      <h2 className="text-lg font-semibold">Settings</h2>
    </div>
    <OutputDirectorySelector value={outputDir} onClick={onDirectorySelect} />
    <QualitySelector settings={settings} onChange={onQualityChange} />
  </div>
);
