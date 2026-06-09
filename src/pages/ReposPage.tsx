import { useEffect, useMemo, useState } from "react";
import { formatStatus, parseGitStatus } from "../features/git/model/gitStatusParser";
import { GitFileStatus, Repository } from "../features/git/model/gitTypes";
import GitFileList from "../features/git/components/GitFileList";
import { useLoading } from "../features/git/hooks/LoaderStates";
import { useGitApi } from "../features/git/api";
import { useActiveRepo } from "../features/git/hooks/ActiveRepository";
import { parseGitDiff } from "../features/git/model/gitDiffParser";
import GitDiffContainer from "../features/git/components/GitDiff";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const ReposPage = () => {
  const [files, setFiles] = useState<GitFileStatus[]>([]);
  const [_, setRepos] = useState<Repository[]>([]);
  const [repoPath, setRepoPath] = useState("");
  const [repoError, setRepoError] = useState("");
  const [repoCommitMsg, setRepoCommitMsg] = useState<string>("");
  const [commitMessage, setCommitMessage] = useState("Add repository list and snapshot shell");
  const [snapshotLabel, setSnapshotLabel] = useState("before-status-panel-polish");
  const {loading, isAnyLoading, isLoading} = useLoading();
  const {activeRepo} = useActiveRepo();
  const { getGitStatus, getGitDiff, gitSnapshot, getRepoConfig, gitCommit, isGitIgnored, saveRepo} = useGitApi();

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    if (activeRepo) {
      saveRepo(activeRepo.path);
      setRepoPath(activeRepo.path);
      resetRepositoryData();
      handleGitStatus(activeRepo.path);
    }
  }, [activeRepo]);

  const hasRepository = Boolean(repoPath);
  const selectedFiles = files.filter((file) => file.checked);
  const selectedFile = selectedFiles[0] ?? files[0];
  const stagedCount = selectedFiles.length;
  const untrackedCount = files.filter((file) => file.status === "??").length;
  const modifiedCount = files.filter((file) => file.status !== "??").length;
  const selectedMeta = selectedFile ? formatStatus(selectedFile.status) : null;
  const latestCommit = repoCommitMsg || "a18c9f2";

  const totalAdditions = useMemo(() => files.reduce((sum, file) => (
    sum + (file.diff?.hunks.reduce((count, hunk) => (
      count + hunk.lines.filter((line) => line.type === "added").length
    ), 0) ?? 0)
  ), 0), [files]);

  const totalRemovals = useMemo(() => files.reduce((sum, file) => (
    sum + (file.diff?.hunks.reduce((count, hunk) => (
      count + hunk.lines.filter((line) => line.type === "removed").length
    ), 0) ?? 0)
  ), 0), [files]);
  
  const isCommitDisabled =
    !hasRepository ||
    isLoading("git.commit") ||
    stagedCount === 0;

  const isSnapshotDisabled =
    !hasRepository ||
    isLoading("git.snapshot");
    
  const toggleFile = (fileName : string) => {
    setFiles((currentFiles) => 
      currentFiles.map((file) => 
        file.file === fileName 
    ? {...file, checked: !file.checked} 
    : file))
  }

  const expandDiff = (fileName : string) => {
    setFiles((currentFiles) => 
      currentFiles.map((file) => 
        file.file === fileName 
    ? {...file, expanded: !file.expanded} 
    : file))
  }

  const loadRepositories = async () => {
    try {
      const config = await getRepoConfig();
      setRepos(config.repositories);
    } catch (error) {
      setRepoError(getErrorMessage(error));
    }
  };

  const resetRepositoryData = () => {
    setFiles([]);
    setRepoError("")
    setRepoCommitMsg("");
  };

  const handleGitStatus = async (path = repoPath) => {
    if (!path) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    try {
      const output = await getGitStatus(path);
      const parsedFiles = parseGitStatus(output);

      const visibleFiles: GitFileStatus[] = [];

      for (const file of parsedFiles) {
        const ignored = await isGitIgnored(path, file);

        if (!ignored) {
          try {
            const diff = await getGitDiff(path, file.file);
            file.diff = parseGitDiff(diff);
          } catch (error) {
            console.log(error);
            setRepoError(getErrorMessage(error));
          }
          
          visibleFiles.push(file);
        }
      }

      updateFilesData(visibleFiles);
      setRepoError("");
    } catch (error) {
      setRepoCommitMsg("");
      setRepoError(getErrorMessage(error));
    }
  };
  
  const updateFilesData = async (dataFiles : GitFileStatus[]) => {
    setFiles(dataFiles)
  }

  const commitSnapshot = async () => {
    if (!repoPath) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    try {
      setRepoCommitMsg(await gitSnapshot(repoPath));
      setRepoPath(repoPath);
      setRepoError("");
    } catch (error) {
      setRepoCommitMsg("");
      setRepoError(getErrorMessage(error));
    }
  };

  const commitRepo = async () => {
    if (!repoPath) {
      setRepoError("Сначала выбери Git-репозиторий");
      return;
    }

    if (!commitMessage.trim()) {
      setRepoError("Введите commit message");
      return;
    }

    try {
      setRepoCommitMsg(await gitCommit(repoPath, commitMessage, files));
      setCommitMessage("");
      setRepoPath(repoPath);
      setRepoError("");
    } catch (error) {
      setRepoCommitMsg("");
      setRepoError(getErrorMessage(error));
    }
  };

  return (
    <div className="repo_status_page">
      <main className="status_main">
        <nav className="workspace_tabs" aria-label="Repository workspace">
          <button className="active" type="button">Dashboard</button>
          <button type="button">Clean repo</button>
          <button type="button">Add modal</button>
          <button type="button">Commit</button>
          <button type="button">Snapshot</button>
          <button type="button">History</button>
          <button type="button">Settings</button>
        </nav>

        <section className="status_content">
          <div className="status_heading">
            <div>
              <h1>Repository status</h1>
              <p>Working tree for {repoPath ? `~${repoPath}` : "~/Dev/gitpulse-app"}. Select files, stage changes, or create a local snapshot.</p>
            </div>
            <span className="loading_pill">
              <span className="pulse_dot" />
              {isAnyLoading ? "Running git status..." : "Ready"}
            </span>
          </div>

          <div className="stat_grid">
            <article className="stat_card">
              <span>Changed files</span>
              <strong>{files.length}</strong>
              <small>{modifiedCount} modified · {untrackedCount} added</small>
            </article>
            <article className="stat_card">
              <span>Staged files</span>
              <strong>{stagedCount}</strong>
              <small>ready to commit</small>
            </article>
            <article className="stat_card">
              <span>Untracked files</span>
              <strong>{untrackedCount}</strong>
              <small>{untrackedCount ? "README.md" : "none"}</small>
            </article>
            <article className="stat_card">
              <span>Last commit</span>
              <strong>{latestCommit.slice(0, 7)}</strong>
              <small>14 min ago</small>
            </article>
          </div>

          <section className="files_panel">
            <div className="file_filters">
              <button className="active" type="button">All</button>
              <button type="button">Modified</button>
              <button type="button">Added</button>
              <button type="button">Deleted</button>
              <button type="button">Untracked</button>
            </div>

            <GitFileList
              onClick={expandDiff}
              onToggle={toggleFile}
              files={files}
              renderExpanded={(file) => (
                loading["git.diff"] ? "Loading diff..." : <GitDiffContainer diffChild={file.diff!}/>
              )}
            />
          </section>
        </section>
      </main>

      <aside className="action_rail">
        <section className="rail_card">
          <div className="rail_card_header">
            <h2>Commit composer</h2>
            <span className="success_pill">{stagedCount} selected</span>
          </div>
          <label>
            Commit message
            <input
              value={commitMessage}
              onChange={(event) => setCommitMessage(event.target.value)}
              placeholder="Commit message"
            />
          </label>
          <label>
            Description
            <textarea
              value="Wire UI state into local repository selection and snapshot card."
              readOnly
            />
          </label>
          <div className="rail_actions">
            <button className="primary_action" disabled={isCommitDisabled} onClick={commitRepo} type="button">
              Commit selected
            </button>
            <button className="secondary_action" disabled={isCommitDisabled} type="button">
              Stage selected
            </button>
          </div>
          <button className="disabled_preview" disabled type="button">Commit disabled state</button>
        </section>

        <section className="rail_card">
          <div className="rail_card_header">
            <h2>Create snapshot</h2>
            <span className="local_pill">local</span>
          </div>
          <p>Save current project state as a local backup commit.</p>
          <label>
            Snapshot label
            <input
              value={snapshotLabel}
              onChange={(event) => setSnapshotLabel(event.target.value)}
            />
          </label>
          <button className="wide_action" disabled={isSnapshotDisabled} onClick={commitSnapshot} type="button">
            Create snapshot
          </button>
        </section>

        <section className="rail_card details_card">
          <div className="rail_card_header">
            <h2>Details</h2>
            {selectedMeta && <span className={`status ${selectedMeta.className}`}>{selectedMeta.label.toLowerCase()}</span>}
          </div>
          <dl>
            <dt>Path</dt>
            <dd>{selectedFile?.file ?? "src/App.tsx"}</dd>
            <dt>Status</dt>
            <dd>{selectedMeta?.label.toLowerCase() ?? "modified"} · selected</dd>
            <dt>Branch</dt>
            <dd>feature/snapshot-flow</dd>
            <dt>Lines</dt>
            <dd>+{totalAdditions} / -{totalRemovals}</dd>
          </dl>
        </section>

        <section className="activity_log">
          <h2>Recent activity</h2>
          <div className="activity_item info">
            <strong>Git status updated</strong>
            <span>gitpulse-app checked 18 seconds ago.</span>
          </div>
          <div className="activity_item success">
            <strong>Commit created</strong>
            <span>{latestCommit.slice(0, 7)} on feature/snapshot-flow.</span>
          </div>
          {repoError && (
            <div className="activity_item danger">
              <strong>Git command failed</strong>
              <span>{repoError}</span>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
};

export default ReposPage;
