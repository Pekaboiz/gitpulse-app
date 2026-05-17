import { GitDiff, GitDiffHunk } from "./gitTypes";

export function parseGitDiff(output: string): GitDiff {
  console.log(output);
  const diff: GitDiff = { hunks: [] };
  const lines = output.split(/\r?\n/);

  let currentHunk: GitDiffHunk | undefined;

  for (const line of lines) {
    if (line.startsWith("--- ")) {
      diff.oldFile = line.slice(4).trim();
      continue;
    }

    if (line.startsWith("+++ ")) {
      diff.newFile = line.slice(4).trim();
      continue;
    }

    const match = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?: (.*))?$/);
    console.log("match: ", match);
    
    if (match) {
      currentHunk = {
        oldStart: Number(match[1]),
        oldLines: match[2] ? Number(match[2]) : 1,
        newStart: Number(match[3]),
        newLines: match[4] ? Number(match[4]) : 1,
        header: match[5],
        lines: [],
      };

      diff.hunks.push(currentHunk);
      continue;
    }

    // дальше разбор строк внутри currentHunk
  }

  return diff;
}
