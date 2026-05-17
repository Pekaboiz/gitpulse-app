mod git;
mod history;
mod models;
mod repositories;
mod storage;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            repositories::verify_repository,
            repositories::save_repository,
            repositories::get_repositories,
            repositories::get_repo_name,
            git::is_git_ignored,
            git::git_snapshot,
            git::git_commit,
            git::git_status,
            git::git_diff,
            history::get_hist_cfg,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}