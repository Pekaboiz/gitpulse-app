import { invoke } from "@tauri-apps/api/core";

export async function getGitStatus(path: string): Promise<string> {
  return invoke<string>("git_status", { repositoryPath : path });
}