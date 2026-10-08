import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...(await files(path)));
    else out.push(path);
  }
  return out;
}
const paths = (await files("dist")).filter((p) => p !== "dist/sw.js").sort();
const hash = createHash("sha256");
for (const path of paths) {
  hash.update(path);
  hash.update(await readFile(path));
}
const sw = await readFile("public/sw.js", "utf8");
const urls = paths.map((p) => p.replace(/^dist\//, ""));
await writeFile(
  "dist/sw.js",
  sw
    .replace("mazal-v1", `mazal-avivim-${hash.digest("hex").slice(0, 12)}`)
    .replace("/* BUILD_ASSETS */ []", JSON.stringify(urls)),
);
