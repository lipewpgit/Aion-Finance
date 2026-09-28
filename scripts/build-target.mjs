import { spawnSync } from "node:child_process";

const embed = spawnSync(process.execPath, ["scripts/embed-dashboard.mjs"], { stdio: "inherit" });
if (embed.status !== 0) process.exit(embed.status ?? 1);

const target = process.env.VERCEL === "1"
  ? ["node_modules/next/dist/bin/next", "build"]
  : ["scripts/run-framework.mjs", "build"];
const build = spawnSync(process.execPath, target, { stdio: "inherit" });
process.exit(build.status ?? 1);
