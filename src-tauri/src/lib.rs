use std::fmt::format;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn git_status(path : &str) -> String {
    use std::process::Command;

    let output = Command::new("git")
                .arg("-C")
                .arg(path)
                .arg("status")
                .output();

    match output {
        Ok(out) => String::from_utf8_lossy(&out.stdout).to_string(),
        Err(e) => format!("Error: {}", e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, git_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
