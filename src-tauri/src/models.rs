use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Files {
    pub status: String,
    pub file: String,
    pub checked: bool,
}

#[derive(Serialize, Deserialize, Clone, Default, Debug)]
pub struct RepositoriesConfig {
    pub repositories: Vec<Repository>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Repository {
    pub name: String,
    pub path: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub enum ActionType {
    #[default]
    Commit,
    Snapshot,
    StatusCheck,
}

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub struct HistoryItem {
    pub action_type: ActionType,
    pub repo_path: String,
    pub message: String,
    pub file_count: usize,
    pub created_at: String,
}