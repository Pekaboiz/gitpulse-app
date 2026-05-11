import { describe, expect, it } from "vitest";
import { parseGitStatus } from "./gitStatusParser";

describe("parseGitStatus", () => {
  it("parses modified file", () => {
    const output = " M src/App.tsx\n";

    const result = parseGitStatus(output);

    expect(result).toEqual([
      {
        status: "M",
        file: "src/App.tsx",
        checked: true,
      },
    ]);
  });

  it("parses untracked file", () => {
    const output = "?? README.md\n";

    const result = parseGitStatus(output);

    expect(result).toEqual([
      {
        status: "??",
        file: "README.md",
        checked: true,
      },
    ]);
  });
});
