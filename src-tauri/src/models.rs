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
#[serde(rename_all = "camelCase")]
pub struct HistoryConfig {
    #[serde(alias = "histConfig")]
    pub hist_config: Vec<HistoryItem>
}

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HistoryItem {
    #[serde(alias = "action_type")]
    pub action_type: ActionType,

    #[serde(alias = "repo_path")]
    pub repo_path: String,

    pub message: String,

    #[serde(alias = "file_count")]
    pub file_count: usize,

    #[serde(alias = "created_at")]
    pub created_at: String,
}