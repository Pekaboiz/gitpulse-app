#[tauri::command]
fn verify_repository(path: String) -> Result<String, String> {
    let repo_path = std::path::Path::new(&path);
    let git_path = repo_path.join(".git");

    if !repo_path.exists() {
        return Err("The path doesn't even exist".to_string());
    }

    if !repo_path.is_dir() {
        return Err("The selected path is not a directory.".to_string());
    }
    
    if !git_path.exists() {
        return Err("The selected folder does not contain any files with the .git extension. This is not a repository.".to_string());
    }

    Ok(path)
}

#[tauri::command]
fn git_status(path: &str) -> String {
    use std::process::Command;

    let output = Command::new("git")
        .arg("-C")
        .arg(path)
        .arg("status")
        .arg("--porcelain")
        .output()
        .expect("failed to execute git");

    String::from_utf8_lossy(&output.stdout).to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![verify_repository, git_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
