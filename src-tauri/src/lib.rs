use tauri::Manager;
use serde::{Deserialize, Serialize};

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

fn repositories_file_path(app : &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let mut path = app
                   .path()
                   .app_data_dir()
                   .map_err(|error| error.to_string())?;
    
    std::fs::create_dir_all(&path)
        .map_err(|error| error.to_string())?;

    path.push("repositories.json");

    Ok(path)
}

#[derive(Serialize, Deserialize, Clone)]
struct Repository {
    path : String,
}

#[tauri::command]
async fn save_repository(app : tauri::AppHandle, repository_path: String) -> Result<(), String> {
    let file_path = repositories_file_path(&app)?;
    
    let mut repositories: Vec<Repository> = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|error| error.to_string())?;

        serde_json::from_str(&content)
            .unwrap_or_else(|_| Vec::new())
    } else {
        Vec::new()
    };

    let already_exists = repositories
                            .iter()
                            .any(|repository| repository.path == repository_path);

    if !already_exists {
        repositories.push(Repository {path : repository_path});
    }

    let json = serde_json::to_string_pretty(&repositories)
                    .map_err(|error| error.to_string())?;
    
    std::fs::write(&file_path, json)
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_repositories(app : tauri::AppHandle) -> Result<Vec<Repository>, String> {
    let file_path = repositories_file_path(&app)?;

    if !file_path.exists() {
        return Ok(Vec::new());
    }

    let content = std::fs::read_to_string(&file_path)
                    .map_err(|error| error.to_string())?;

    let repositories = serde_json::from_str(&content)
                        .map_err(|error| error.to_string())?; 

    Ok(repositories)
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
        .invoke_handler(tauri::generate_handler![verify_repository, 
                                                 save_repository, 
                                                 get_repositories, 
                                                 git_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
