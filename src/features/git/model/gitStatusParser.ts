//test
import { GitFileStatus } from "./gitTypes";

export function parseGitStatus(output : string) : GitFileStatus[] {
return output
        .split("\n")
        .filter(Boolean)
        .map((line) => {
        const status = line.slice(0, 2).trim();
        const file = line.slice(3);
        const checked = true;
        return{status, file, checked};
        });
}

export function formatStatus(status: string) {
   switch (status) {
    case "M":
      return { label: "Modified", className: "modified" };
    case "??":
      return { label: "New", className: "new" };
    case "D":
      return { label: "Deleted", className: "deleted" };
    default:
      return { label: status, className: "" };
  }
}