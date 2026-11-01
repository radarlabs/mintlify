// Fails if any page in the docs.json navigation is missing a frontmatter
// `description`.
//
// Usage: node .github/scripts/check-page-descriptions.mjs
//
// Mintlify uses `description` for the page's <meta name="description"> and for
// the per-page summary in /llms.txt, which AI agents read to decide which page
// to open. A page without one shows up in llms.txt as a bare link.

import { readFileSync, existsSync } from "node:fs";

const docs = JSON.parse(readFileSync("docs.json", "utf8"));

// Navigation entries are either page paths (strings) or objects such as groups,
// whose nested `pages` hold more entries. Group names and icons are strings
// too, so only descend into `pages` and other nav containers.
const NAV_KEYS = new Set(["pages", "groups", "tabs", "anchors", "dropdowns", "versions", "languages"]);
const collect = (node, out = []) => {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) if (NAV_KEYS.has(k)) collect(v, out);
  return out;
};

const missing = [];
for (const page of collect(docs.navigation)) {
  const file = `${page}.mdx`;
  if (!existsSync(file)) {
    console.warn(`warning: ${page} is in docs.json but ${file} does not exist`);
    continue;
  }
  const frontmatter = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const description = frontmatter.match(/^description:\s*(.*)$/m)?.[1].replace(/^["']|["']$/g, "").trim();
  if (!description) missing.push(file);
}

if (missing.length) {
  console.error(`These pages need a one-sentence \`description\` in their frontmatter:\n`);
  for (const file of missing) console.error(`  ${file}`);
  console.error(`\nIt's used for search snippets and the page summary in /llms.txt. See README.md.`);
  process.exit(1);
}
console.log("Every page in the navigation has a description.");
