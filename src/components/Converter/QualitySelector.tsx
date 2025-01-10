import { qualityOptions } from "../../constants";
import { useState } from "react";

interface QualitySelectorProps {
  settings: { quality: string };
  onChange: (newSettings: { quality: string }) => void; // Changed type
}

const QualitySelector = ({ settings, onChange }: QualitySelectorProps) => {
  const [customBitrate, setCustomBitrate] = useState("");

  const handleQualityChange = (value: string) => {
    if (value === "custom") {
      // Just set the quality to 'custom' when selected
      onChange({ quality: "custom" });
    } else {
      onChange({ quality: value });
    }
  };

  const handleCustomBitrateChange = (value: string) => {
    setCustomBitrate(value);
    if (value) {
      onChange({ quality: `${value}M` });
    }
  };

  // Helper function to check if the quality is one of our preset options
  const isPresetQuality = (quality: string) => {
    return qualityOptions.some((option) => option.bitrate === quality);
  };

  console.log(settings.quality);
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Quality Settings</label>

      <div className="space-y-2">
        <select
          value={settings.quality.endsWith("M") ? settings.quality : "custom"}
          onChange={(e) => handleQualityChange(e.target.value)}
          className="w-full p-2 border rounded bg-white"
        >
          {qualityOptions.map((option) => (
            <option value={option.bitrate} key={option.bitrate}>
              {option.label} Quality 
            </option>
          ))}
          <option value="custom">Custom Bitrate...</option>
        </select>

        {!isPresetQuality(settings.quality) && (
          <input
            type="number"
            value={customBitrate || settings.quality.replace("M", "")}
            onChange={(e) => handleCustomBitrateChange(e.target.value)}
            placeholder="Enter bitrate (e.g., 2 for 2M)"
            className="w-full p-2 border rounded bg-white"
            min="0.1"
            step="0.1"
          />
        )}
      </div>
    </div>
  );
};

export default QualitySelector;
