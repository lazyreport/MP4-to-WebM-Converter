use std::process::Command;
use tauri::command;

#[command]
fn convert_to_webm(input_path: String, output_dir: String, quality: String) -> Result<String, String> {
    let file_name = std::path::Path::new(&input_path)
        .file_stem()
        .and_then(|n| n.to_str())
        .unwrap_or("output");
    
    let quality_label = match quality.as_str() {
        "1M" => "low",
        "4M" => "high",
        "8M" => "very_high",
        "16M" => "ultra",
        _ => "medium",
    };
    
    let output_path = format!("{}/{}_converted_webm_{}.webm", output_dir, file_name, quality_label);
    
    let status = Command::new("ffmpeg")
        .args([
            "-i", &input_path,
            "-c:v", "libvpx-vp9",  // VP9 codec
            "-b:v", &quality,      // Video bitrate
            "-cpu-used", "2",      // CPU usage preset (0-8, lower means better quality but slower)
            "-row-mt", "1",        // Enable row-based multithreading
            "-tile-columns", "2",  // Number of tile columns
            "-frame-parallel", "1", // Enable frame parallel processing
            "-auto-alt-ref", "1",  // Enable alternative reference frames
            "-lag-in-frames", "25", // Number of frames to look ahead for motion estimation
            "-deadline", "best",    // Encoding deadline/quality (good, best, realtime)
            "-crf", "16",          // Constant Rate Factor (0-63, lower means better quality)
            "-c:a", "libopus",     // Audio codec
            "-b:a", "128k",        // Audio bitrate
            &output_path
        ])
        .status()
        .map_err(|e| e.to_string())?;

    if status.success() {
        Ok(output_path)
    } else {
        Err("Conversion failed".to_string())
    }
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![convert_to_webm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}