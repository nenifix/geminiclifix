import { exec } from "./exec.js";

const gh = async (args: string): Promise<string> => {
  return exec(`gh ${args}`);
};

// ── Repos ──────────────────────────────────────────────

export async function ghRepoCreate(name: string, options?: { description?: string; private?: boolean; push?: boolean }): Promise<string> {
  let cmd = `repo create ${name}`;
  if (options?.description) cmd += ` --description "${options.description}"`;
  if (options?.private) cmd += " --private";
  else cmd += " --public";
  if (options?.push) cmd += " --push --source=.";
  return gh(cmd);
}

export async function ghRepoClone(urlOrName: string, dir?: string): Promise<string> {
  return dir ? `repo clone ${urlOrName} ${dir}` : `repo clone ${urlOrName}`;
}

// ── Commits & Push ─────────────────────────────────────

export async function ghCommit(message: string, branch?: string): Promise<string> {
  let result = await exec("git add -A");
  result += "\n" + await exec(`git commit -m "${message}"`);
  if (branch) {
    result += "\n" + await exec(`git push -u origin ${branch}`);
  } else {
    result += "\n" + await exec("git push");
  }
  return result;
}

export async function ghSync(): Promise<string> {
  return exec("git pull --rebase && git push");
}

// ── Pull Requests ──────────────────────────────────────

export async function ghPrCreate(title: string, options?: { body?: string; base?: string; draft?: boolean }): Promise<string> {
  let cmd = `pr create --title "${title}"`;
  if (options?.body) cmd += ` --body "${options.body}"`;
  if (options?.base) cmd += ` --base ${options.base}`;
  if (options?.draft) cmd += " --draft";
  return gh(cmd);
}

export async function ghPrList(state?: string): Promise<string> {
  return gh(`pr list ${state ? `--state ${state}` : ""}`);
}

export async function ghPrMerge(prNumber: string, method?: string): Promise<string> {
  return gh(`pr merge ${prNumber}${method ? ` --${method}` : ""}`);
}

// ── Issues ─────────────────────────────────────────────

export async function ghIssueCreate(title: string, options?: { body?: string; labels?: string }): Promise<string> {
  let cmd = `issue create --title "${title}"`;
  if (options?.body) cmd += ` --body "${options.body}"`;
  if (options?.labels) cmd += ` --label "${options.labels}"`;
  return gh(cmd);
}

export async function ghIssueList(state?: string): Promise<string> {
  return gh(`issue list ${state ? `--state ${state}` : ""}`);
}

// ── Branches ───────────────────────────────────────────

export async function ghBranchCreate(name: string): Promise<string> {
  return exec(`git checkout -b ${name}`);
}

export async function ghBranchList(): Promise<string> {
  return exec("git branch -a");
}

export async function ghBranchCheckout(name: string): Promise<string> {
  return exec(`git checkout ${name}`);
}

// ── Gists ──────────────────────────────────────────────

export async function ghGistCreate(filename: string, description?: string, pub?: boolean): Promise<string> {
  let cmd = `gist create ${filename}`;
  if (description) cmd += ` --description "${description}"`;
  if (!pub) cmd += " --secret";
  return gh(cmd);
}

export async function ghGistList(): Promise<string> {
  return gh("gist list");
}

// ── CI / Workflows ─────────────────────────────────────

export async function ghRunList(limit?: string): Promise<string> {
  return gh(`run list ${limit ? `-L ${limit}` : "-L 10"}`);
}

export async function ghRunWatch(runId: string): Promise<string> {
  return gh(`run watch ${runId}`);
}

// ── Generic pass-through ───────────────────────────────

export async function ghRaw(args: string): Promise<string> {
  return gh(args);
}
