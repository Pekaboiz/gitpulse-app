use std::fs::read_to_string;

use crate::models::{HistoryConfig, HistoryItem};
use crate::storage::app_json_file_path;

pub fn add_history_item(
    app: &tauri::AppHandle,
    hist_item: HistoryItem,
) -> Result<(), String> {
    let file_path = app_json_file_path(app, "logger")?;

    let mut items: Vec<HistoryItem> = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|error| error.to_string())?;

        serde_json::from_str(&content)
            .map_err(|error| error.to_string())?
    } else {
        Vec::new()
    };

    items.push(hist_item);

    let json = serde_json::to_string_pretty(&items)
        .map_err(|error| error.to_string())?;

    std::fs::write(&file_path, json)
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_hist_cfg(
    app: tauri::AppHandle
) -> Result<HistoryConfig, String> {
    let file_path = app_json_file_path(&app, "logger")?;
    
    if !file_path.exists() {
        return Ok(HistoryConfig::default());
    }

    let content = read_to_string(file_path)
                    .map_err(|error| error.to_string())?;

    let items : Vec<HistoryItem> = serde_json::from_str(&content)
                                    .map_err(|error| error.to_string())?;

    let config = HistoryConfig{hist_config : items};

    Ok(config)
}