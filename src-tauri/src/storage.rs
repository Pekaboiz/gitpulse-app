use tauri::Manager;

pub fn app_json_file_path(
    app: &tauri::AppHandle,
    name: &str,
) -> Result<std::path::PathBuf, String> {
    let mut path = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;

    std::fs::create_dir_all(&path)
        .map_err(|error| error.to_string())?;

    path.push(format!("{name}.json"));

    Ok(path)
}