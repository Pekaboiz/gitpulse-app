use std::path::Path;
use std::process::Command;

use crate::models::{RepositoriesConfig, Repository};
use crate::storage::app_json_file_path;

#[tauri::command]
pub fn verify_repository(path: String) -> Result<String, String> {
    let repo_path = Path::new(&path);
    let git_path = repo_path.join(".git");

    if !repo_path.exists() {
        return Err("The path doesn't even exist".to_string());
    }

    if !repo_path.is_dir() {
        return Err("The selected path is not a directory.".to_string());
    }

    if !git_path.exists() {
        return Err("The selected folder does not contain .git. This is not a repository.".to_string());
    }

    Ok(path)
}

#[tauri::command]
pub async fn save_repository(
    app: tauri::AppHandle,
    repository_path: String,
) -> Result<(), String> {
    let file_path = app_json_file_path(&app, "repositories")?;

    let mut config: RepositoriesConfig = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|error| error.to_string())?;

        serde_json::from_str(&content).unwrap_or_default()
    } else {
        RepositoriesConfig::default()
    };

    let already_exists = config
        .repositories
        .iter()
        .any(|repository| repository.path == repository_path);

    if !already_exists {
        config.repositories.push(Repository {
            name: get_repo_name(repository_path.clone())?,
            path: repository_path,
        });
    }

    let json = serde_json::to_string_pretty(&config)
        .map_err(|error| error.to_string())?;

    std::fs::write(&file_path, json)
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_repositories(
    app: tauri::AppHandle,
) -> Result<RepositoriesConfig, String> {
    let file_path = app_json_file_path(&app, "repositories")?;

    if !file_path.exists() {
        return Ok(RepositoriesConfig::default());
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|error| error.to_string())?;

    let repositories = serde_json::from_str(&content)
        .map_err(|error| error.to_string())?;

    Ok(repositories)
}

fn extract_repo_name(remote_url: &str) -> String {
    remote_url
        .trim_end_matches(".git")
        .rsplit(['/', ':'])
        .next()
        .unwrap_or(remote_url)
        .to_string()
}

#[tauri::command]
pub fn get_repo_name(repo_path: String) -> Result<String, String> {
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
        .map_err(|error| error.to_string())?;

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