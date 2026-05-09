use std::process::Command;

use chrono::OutOfRange;

use crate::history::add_history_item;
use crate::models::{ActionType, Files, HistoryItem};

#[tauri::command]
pub fn git_commit(
    app: tauri::AppHandle,
    repository_path: String,
    message: String,
    files: Vec<Files>,
) -> Result<String, String> {
    let checked_files: Vec<String> = files
        .iter()
        .filter(|file| file.checked)
        .map(|file| file.file.clone())
        .collect();

    if checked_files.is_empty() {
        return Err("No files selected for commit".to_string());
    }

    if message.trim().is_empty() {
        return Err("Commit message is empty".to_string());
    }

    let add_output = Command::new("git")
        .current_dir(&repository_path)
        .arg("add")
        .args(&checked_files)
        .output()
        .map_err(|error| error.to_string())?;

    if !add_output.status.success() {
        return Err(String::from_utf8_lossy(&add_output.stderr).to_string());
    }

    let commit_output = Command::new("git")
        .current_dir(&repository_path)
        .args(["commit", "-m", &message])
        .output()
        .map_err(|error| error.to_string())?;

    if !commit_output.status.success() {
        return Err(String::from_utf8_lossy(&commit_output.stderr).to_string());
    }

    let output_message = String::from_utf8_lossy(&commit_output.stdout).to_string();

    add_history_item(
        &app,
        HistoryItem {
            action_type: ActionType::Commit,
            repo_path: repository_path.clone(),
            message: output_message.clone(),
            file_count: checked_files.len(),
            created_at: chrono::Utc::now().to_rfc3339(),
        },
    )?;

    Ok(output_message)
}

#[tauri::command]
pub fn git_snapshot(app: tauri::AppHandle, repo_path : String) -> Result<String, String> {
    let add_output = Command::new("git")
                     .arg("-C")
                     .arg(&repo_path)
                     .arg("add")
                     .arg("-A")
                     .output()
                     .map_err(|error| error.to_string())?;
    
    if !add_output.status.success() {
        return Err(String::from_utf8_lossy(&add_output.stderr).to_string());
    }

     let message = "snapshot: automatic backup";

    let commit_output = Command::new("git")
        .arg("-C")
        .arg(&repo_path)
        .arg("commit")
        .arg("-m")
        .arg(message)
        .output()
        .map_err(|err| err.to_string())?;

    if !commit_output.status.success() {
        return Err(String::from_utf8_lossy(&commit_output.stderr).to_string());
    }

    add_history_item(
        &app,
        HistoryItem {
            action_type: ActionType::Commit,
            repo_path: repo_path.clone(),
            message: String::from_utf8_lossy(&commit_output.stdout).to_string(),
            file_count: 0,
            created_at: chrono::Utc::now().to_rfc3339(),
        },
    )?;

    Ok(String::from_utf8_lossy(&commit_output.stdout).to_string())
}

#[tauri::command]
pub fn git_status(path: String) -> Result<String, String> {
    let output = Command::new("git")
        .arg("-C")
        .arg(path)
        .arg("status")
        .arg("--porcelain")
        .output()
        .map_err(|error| error.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
pub fn is_git_ignored(
    repository_path: String,
    file_path: String,
) -> Result<bool, String> {
    let output = Command::new("git")
        .arg("-C")
        .arg(&repository_path)
        .arg("check-ignore")
        .arg(&file_path)
        .output()
        .map_err(|error| error.to_string())?;
    
    Ok(output.status.success())
}