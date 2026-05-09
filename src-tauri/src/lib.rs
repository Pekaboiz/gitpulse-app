//test
use std::{path::Path};
use tauri::Manager;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Files {
    status : String,
    file : String,
    checked : bool,
}

#[tauri::command]
fn git_commit(repository_path : String, message : String, files : Vec<Files>) -> Result<String, String> {
    let checked_files: Vec<String>  = files.iter()
                                      .filter(|f| f.checked)
                                      .filter(|f| !f.file.starts_with("node_modules/"))
                                      .filter(|f| !f.file.starts_with("dist/"))
                                      .filter(|f| !f.file.starts_with("src-tauri/target/"))
                                      .map(|el| el.file.clone())
                                      .collect();

    if checked_files.is_empty() {
        return Err("No files selected for commit".to_string());
    }

    let add_output = std::process::Command::new("git")
                    .current_dir(&repository_path)
                    .arg("add")
                    .args(&checked_files)
                    .output()
                    .map_err(|error| error.to_string())?;

    if !add_output.status.success() {
        return Err(String::from_utf8_lossy(&add_output.stdout).to_string());
    }

    let commit_output = std::process::Command::new("git")
                    .current_dir(&repository_path)
                    .args(["commit", "-m", &message])
                    .output()
                    .map_err(|error| error.to_string())?;

    if !commit_output.status.success() {
        return Err(String::from_utf8_lossy(&commit_output.stdout).to_string());
    }

    Ok(String::from_utf8_lossy(&commit_output.stdout).to_string())
}

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

fn repositories_file_path(app : &tauri::AppHandle, name : &str) -> Result<std::path::PathBuf, String> {
    let mut path = app
                   .path()
                   .app_data_dir()
                   .map_err(|error| error.to_string())?;
    
    std::fs::create_dir_all(&path)
        .map_err(|error| error.to_string())?;

    path.push(format!("{name}.json"));

    Ok(path)
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct RepositoriesConfig {
    pub repositories: Vec<Repository>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Repository {
    name : String,
    path : String,
}

#[tauri::command]
async fn save_repository(app : tauri::AppHandle, repository_path: String) -> Result<(), String> {
    let file_path = repositories_file_path(&app, "repositories")?;

    let mut config: RepositoriesConfig = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|error| error.to_string())?;

        serde_json::from_str(&content)
            .unwrap_or_default()
    } else {
        RepositoriesConfig::default()
    };
    
    let already_exists = config
                            .repositories
                            .iter()
                            .any(|repository| repository.path == repository_path);

    if !already_exists {
        config.repositories.push(Repository {name : get_repo_name(repository_path.clone())?, 
                                      path : repository_path});
    }

    let json = serde_json::to_string_pretty(&config)
                    .map_err(|error| error.to_string())?;
    
    std::fs::write(&file_path, json)
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_repositories(app : tauri::AppHandle) -> Result<RepositoriesConfig, String> {
    let file_path = repositories_file_path(&app, "repositories")?;

    if !file_path.exists() {
        return Ok(RepositoriesConfig::default());
    }

    let content = std::fs::read_to_string(&file_path)
                    .map_err(|error| error.to_string())?;

    let repositories = serde_json::from_str(&content)
                        .map_err(|error| error.to_string())?; 

    Ok(repositories)
}

fn extract_repo_name(remote_url : &str) -> String {
    remote_url
        .trim_end_matches(".git")
        .rsplit(['/', ':'])
        .next()
        .unwrap_or(remote_url)
        .to_string()
}

#[tauri::command]
fn get_repo_name(repo_path : String) -> Result<String, String> {
    use std::process::Command;

    let remote_output = Command::new("git")
                    .args(["remote", "get-url", "origin"])
                    .current_dir(&repo_path)
                    .output();

    if let Ok(output) = remote_output {
        if output.status.success() {
            let remote_url = String::from_utf8_lossy(&output.stdout)
                                .trim()
                                .to_string();
            if !remote_url.is_empty() {
                return Ok(extract_repo_name(&remote_url));
            }
        }
    }

    let root_output = Command::new("git")
        .args(["rev-parse", "--show-toplevel"])
        .current_dir(&repo_path)
        .output()
        .map_err(|e| e.to_string())?;

    if !root_output.status.success() {
        return Err(String::from_utf8_lossy(&root_output.stderr).to_string());
    }

    let repo_root = String::from_utf8_lossy(&root_output.stdout)
        .trim()
        .to_string();

    let folder_name = Path::new(&repo_root)
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or("Failed to get repository folder name")?
        .to_string();

    Ok(folder_name)
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

#[derive(Debug, Serialize, Deserialize, Default)]
enum ActionType {
    #[default]
    Commit,
    Snapshot,
    StatusCheck,
}

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
struct HistoryItem {
    action_type : ActionType ,
    repo_path : String,
    message : String,
    file_count : usize,
    created_at : usize,
}

fn add_history_item(app : tauri::AppHandle, hist_item : HistoryItem) -> Result<(), String> {
    let file_path = repositories_file_path(&app, "logging")?;

    let mut item : HistoryItem = if file_path.exists() {
        let content: String = std::fs::read_to_string(&file_path)
        .map_err(|error| error.to_string())?;

        serde_json::from_str(&content)
            .map_err(|error| error.to_string())?
    } else {
        HistoryItem::default()
    };

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![verify_repository, 
                                                 save_repository, 
                                                 get_repositories, 
                                                 git_commit,
                                                 git_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
