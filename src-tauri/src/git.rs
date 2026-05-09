use std::process::Command;

use crate::history::add_history_item;
use crate::models::{ActionType, Files, HistoryItem};

fn stdout_to_string(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).to_string()
}

fn stderr_to_string(bytes: &[u8]) -> String {
    String::from_utf8_lossy(bytes).trim().to_string()
}

fn run_git_command(repository_path: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .arg("-C")
        .arg(repository_path)
        .args(args)
        .output()
        .map_err(|error| error.to_string())?;

    if !output.status.success() {
        return Err(stderr_to_string(&output.stderr));
    }

    Ok(stdout_to_string(&output.stdout))
}

#[tauri::command]
pub fn git_commit(
    app: tauri::AppHandle,
    repository_path: String,
    message: String,
    files: Vec<Files>,
) -> Result<String, String> {
    let message = message.trim().to_string();

    if message.is_empty() {
        return Err("Commit message is empty".to_string());
    }

    let checked_files: Vec<String> = files
        .iter()
        .filter(|file| file.checked)
        .map(|file| file.file.clone())
        .collect();

    println!("checked_files: {:?}", checked_files);

    if checked_files.is_empty() {
        return Err("No files selected for commit".to_string());
    }

    let add_output = Command::new("git")
        .arg("-C")
        .arg(&repository_path)
        .arg("add")
        .args(&checked_files)
        .output()
        .map_err(|error| error.to_string())?;

    println!("add_output: {:?}", add_output);

    if !add_output.status.success() {
        return Err(stderr_to_string(&add_output.stderr));
    }

    let commit_output = Command::new("git")
        .arg("-C")
        .arg(&repository_path)
        .arg("commit")
        .arg("-m")
        .arg(&message)
        .output()
        .map_err(|error| error.to_string())?;

    println!("commit_output: {:?}", commit_output);

    if !commit_output.status.success() {
        let error_message = stderr_to_string(&commit_output.stderr);

        if error_message.contains("nothing to commit") {
            return Err("Nothing to commit".to_string());
        }

        return Err(error_message);
    }

    let output_message = stdout_to_string(&commit_output.stdout);

    println!("output_message: {:?}", output_message);

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
pub fn git_snapshot(app: tauri::AppHandle, repository_path: String) -> Result<String, String> {
    let status_output = run_git_command(&repository_path, &["status", "--porcelain"]);
    let status_output = status_output?;

    let file_count = status_output.lines().count();

    if file_count == 0 {
        return Err("No changes to snapshot".to_string());
    }

    run_git_command(&repository_path, &["add", "-A"])?;

    let message = "snapshot: automatic backup";

    let commit_output = Command::new("git")
        .arg("-C")
        .arg(&repository_path)
        .arg("commit")
        .arg("-m")
        .arg(message)
        .output()
        .map_err(|error| error.to_string())?;

    if !commit_output.status.success() {
        let error_message = stderr_to_string(&commit_output.stderr);

        if error_message.contains("nothing to commit") {
            return Err("Nothing to snapshot".to_string());
        }

        return Err(error_message);
    }

    let output_message = stdout_to_string(&commit_output.stdout);

    add_history_item(
        &app,
        HistoryItem {
            action_type: ActionType::Snapshot,
            repo_path: repository_path.clone(),
            message: output_message.clone(),
            file_count,
            created_at: chrono::Utc::now().to_rfc3339(),
        },
    )?;

    Ok(output_message)
}

#[tauri::command]
pub fn git_status(repository_path: String) -> Result<String, String> {
    run_git_command(&repository_path, &["status", "--porcelain"])
}

#[tauri::command]
pub fn is_git_ignored(repository_path: String, file_path: String) -> Result<bool, String> {
    let output = Command::new("git")
        .arg("-C")
        .arg(&repository_path)
        .arg("check-ignore")
        .arg(&file_path)
        .output()
        .map_err(|error| error.to_string())?;

    Ok(output.status.success())
}