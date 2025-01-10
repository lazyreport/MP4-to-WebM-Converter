use std::process::Command;
use tauri::command;
use tauri::Manager;
use std::path::PathBuf;
use tauri::path::BaseDirectory;


fn get_file_size_mb(path: &str) -> Result<f64, String> {
    let metadata = std::fs::metadata(path)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;
    Ok(metadata.len() as f64 / (1024.0 * 1024.0))  // Convert bytes to MB
}

#[command]
fn convert_to_webm(
     app: tauri::AppHandle,
    input_path: String, 
    output_dir: String, 
    quality: String) -> Result<ConversionResult, String> {

    let input_size = get_file_size_mb(&input_path)?;

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

    let (quality_type, bitrate) = if quality.ends_with('M') {
        match quality.as_str() {
            "1M" => ("verylow", "1M"),
            "2M" => ("low", "2M"),
            "4M" => ("medium", "4M"),
            "8M" => ("high", "8M"),
            "16M" => ("veryhigh", "16M"),
            custom => ("custom", custom)  // For custom bitrates
            }
        } else {
            ("high", "4M")  // default fallback
        };

        // Created a PathBuf version of the path
        let output_pathbuf = PathBuf::from(&output_dir)
            .join(format!("{}_webminified_{}_{}.webm", 
                file_name, 
                quality_type, 
                bitrate
            ));

        
        // Convert to string once for Command usage
        let output_path = output_pathbuf.to_string_lossy().into_owned();
        
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
            
 
 
    // Enhanced error handling
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("FFmpeg conversion failed: {}", stderr));
    }
    let output_size = get_file_size_mb(&output_path)?;
    let compression_ratio = (1.0 - (output_size / input_size)) * 100.0;

    let final_path = PathBuf::from(&output_dir)
    .join(format!("{}_webminified_{}_{}_CR{:.1}%.webm", 
        file_name,
        quality_type,
        bitrate,
        compression_ratio.abs()
    ));

    std::fs::rename(&output_path, &final_path)
    .map_err(|e| format!("Failed to rename output file: {}", e))?;

    Ok(ConversionResult {
        output_path,
        input_size,
        output_size,
        compression_ratio,
        quality: quality.clone(),
    })

}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![convert_to_webm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[derive(serde::Serialize)]
struct ConversionResult {
    output_path: String,
    input_size: f64,
    output_size: f64,
    compression_ratio: f64,
    quality: String,
}