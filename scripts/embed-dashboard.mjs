import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sourceUrl = new URL("../app/painel/dashboard.html", import.meta.url);
const outputUrl = new URL("../app/painel/dashboard.generated.ts", import.meta.url);
const html = await readFile(fileURLToPath(sourceUrl), "utf8");
await writeFile(fileURLToPath(outputUrl), `// Gerado por scripts/embed-dashboard.mjs.\nconst dashboard = ${JSON.stringify(html)};\nexport default dashboard;\n`, "utf8");
