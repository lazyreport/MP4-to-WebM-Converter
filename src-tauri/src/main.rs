use std::process::Command;
use tauri::command;
use tauri::Manager;
use std::path::PathBuf;
use tauri::path::BaseDirectory;


#[command]
fn convert_to_webm(
     app: tauri::AppHandle,
    input_path: String, 
    output_dir: String, 
    quality: String) -> Result<String, String> {



let ffmpeg_path = app.path().resource_dir()
    .map_err(|e| e.to_string())?
    .join("binaries")
    .join("windows")
    .join("ffmpeg.exe");

    println!("FFmpeg path: {}", ffmpeg_path.display());
    println!("FFmpeg exists: {}", ffmpeg_path.exists());

       if let Some(parent) = ffmpeg_path.parent() {
        println!("Directory contents:");
        if let Ok(entries) = std::fs::read_dir(parent) {
            for entry in entries {
                if let Ok(entry) = entry {
                    println!("  {}", entry.path().display());
                }
            }
        }
    }

let version_output = Command::new(&ffmpeg_path)
    .arg("-version")
    .output()
    .map_err(|e| format!("Failed to execute FFmpeg version check: {}", e))?;

    println!("FFmpeg version: {:?}", version_output);


     let input_path = PathBuf::from(input_path)
        .to_string_lossy()
        .into_owned();


    let file_name = std::path::Path::new(&input_path)
        .file_stem()
        .and_then(|n| n.to_str())
        .unwrap_or("output");

    let quality_label = match quality.as_str() {
        "1M" => "low",
        "4M" => "high",
        "8M" => "veryhigh",
        "16M" => "ultra",
         _=> "medium",
    };

    // Created a PathBuf version of the path
    let output_pathbuf = PathBuf::from(&output_dir)
        .join(format!("{}_converted_webm_{}.webm", file_name, quality_label));

    // Convert to string once for Command usage
    let output_path = output_pathbuf.to_string_lossy().into_owned();


    println!("Input path: {:?}", input_path);
    println!("Output path: {:?}", output_path);


    let output = Command::new(ffmpeg_path)
        .args([
        "-i", &input_path,
         "-v", "debug",  // Increase verbosity
        "-c:v", "libvpx-vp9",
         "-strict", "-2",
        "-b:v", &quality,    
      &output_path
        ])
        .output()
        .map_err(|e| format!("Failed to execute FFmpeg: {}", e))?;

    // Print both stdout and stderr
    println!("FFmpeg stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("FFmpeg stderr: {}", String::from_utf8_lossy(&output.stderr));

 
    // Enhanced error handling
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("FFmpeg conversion failed: {}", stderr));
    }

      Ok(output_path)

}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![convert_to_webm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}