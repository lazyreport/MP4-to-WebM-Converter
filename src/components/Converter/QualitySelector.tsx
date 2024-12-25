import { qualityOptions } from "../../constants";

interface QualitySelectorProps {
  settings: { quality: string };
  onChange: (newSettings: { quality: string }) => void; // Changed type
}

const QualitySelector = ({ settings, onChange }: QualitySelectorProps) => (
  <div>
    <label className="block text-sm font-medium mb-1">Quality Settings</label>
    <select
      value={settings.quality}
      onChange={(e) => onChange({ quality: e.target.value })}
      className="w-full p-2 border rounded bg-white"
    >
      {qualityOptions.map((option) => (
        <option value={option.bitrate} key={option.bitrate}>
          {option.label} Quality ({option.estimate})
        </option>
      ))}
    </select>
  </div>
);

export default QualitySelector;
