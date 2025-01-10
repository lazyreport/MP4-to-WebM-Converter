import React, { useCallback, useState } from "react";
import { ConversionResult, FileWithPath } from "../../types";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { DragDropArea } from "./DragDropArea";
import { SettingsPanel } from "./SettingsPanel";
import FileList from "./FileList";

const Converter = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [outputDir, setOutputDir] = useState("");
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [settings, setSettings] = useState({
    quality: "4M", // default to medium
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "video/mp4"
    ) as unknown as FileWithPath[];

    if (droppedFiles.length === 0) {
      setError("Please drop only MP4 files.");
      return;
    }

    // Need to get the paths
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = async () => {
    try {
      const filePath = await open({
        filters: [
          {
            name: "MP4",
            extensions: ["mp4"],
          },
        ],
      });

      if (filePath) {
        const fileName = filePath.toString().split("\\").pop() || "video.mp4";
        setFiles((prev) => [
          ...prev,
          {
            name: fileName,
            path: filePath as string,
          },
        ]);
      }
    } catch (err) {
      setError("Failed to select file");
    }
  };

  const handleOutputDirSelect = async () => {
    try {
      console.log("Starting directory selection...");
      const selected = await open({
        directory: true,
        multiple: false,
      });
      console.log("Selected directory:", selected);

      if (selected === null) {
        console.log("No directory selected (cancelled)");
        return;
      }

      setOutputDir(selected as string);
    } catch (err: unknown) {
      console.error("Directory selection error details:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to select directory: ${errorMessage}`);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const convertFiles = async () => {
    if (!outputDir) {
      setError("Please select an output directory first");
      return;
    }

    setConverting(true);
    setError("");
    setSuccess("");

    try {
      for (const file of files) {
        console.log("Converting with settings:", {
          inputPath: file.path,
          outputDir: outputDir,
          quality: settings.quality,
        });

        await invoke<ConversionResult>("convert_to_webm", {
          inputPath: file.path,
          outputDir: outputDir,
          quality: settings.quality,
        }).then((result: ConversionResult) => {
          const conversionResult = result as ConversionResult;

          console.log(
            `Original size: ${conversionResult.input_size.toFixed(2)} MB`
          );
          console.log(
            `Compressed size: ${conversionResult.output_size.toFixed(2)} MB`
          );
          console.log(
            `Compression ratio: ${conversionResult.compression_ratio.toFixed(
              2
            )}%`
          );
          console.log(`Quality used: ${conversionResult.quality}`);
        });
      }
      setSuccess("Conversion completed successfully!");
      setFiles([]);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(`Conversion failed: ${err}`);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="title">
        <h1 className="text-2xl font-bold mb-2">MP4 to WebM Converter</h1>
        <p className="text-gray-600">
          Convert your MP4 videos to WebM format easily
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          {success}
        </div>
      )}

      {/* DragDropArea */}
      <DragDropArea
        dragActive={dragActive}
        converting={converting}
        onDrag={handleDrag}
        onDrop={handleDrop}
        onFileSelect={handleFileSelect}
      />

      {/* Settings Panel */}
      <SettingsPanel
        outputDir={outputDir}
        settings={settings}
        onDirectorySelect={handleOutputDirSelect}
        onQualityChange={(newSettings) => setSettings(newSettings)}
      />

      {/* File List */}
      <FileList files={files} onRemove={removeFile} />

      <button
        onClick={convertFiles}
        disabled={files.length === 0 || converting || !outputDir}
        className={`w-full py-3 px-4 rounded-lg font-semibold
    ${
      files.length === 0 || converting || !outputDir
        ? "bg-gray-300 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600 text-white"
    }`}
      >
        {converting ? "Converting..." : "Convert to WebM"}
      </button>
    </div>
  );
};

export default Converter;
