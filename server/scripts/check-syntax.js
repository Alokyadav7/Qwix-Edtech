import { readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (name === "node_modules" || name === "dist") return [];
    return statSync(path).isDirectory() ? files(path) : path.endsWith(".js") ? [path] : [];
  });
}

const targets = ["server.js", ...files("src"), ...files("scripts").filter((file) => !file.endsWith("check-syntax.js"))];
let failed = false;

for (const file of targets) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);

