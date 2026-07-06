// Bumps the Radar SDK versions referenced in a single docs file.
//
// Usage: node bump-sdk-version.mjs <ios|android> <latestTag> <file>
//
// Prints machine-readable key=value lines to stdout (for $GITHUB_OUTPUT):
//   changed=true|false
//   version=<new version>
//   current=<version currently in the docs>
// All human-facing logging goes to stderr so stdout stays clean.
//
// Only the file passed in is edited, and only the canonical install snippets
// within it. Tutorial / plugin pins in other files are never touched.

import { readFileSync, writeFileSync } from "node:fs";

const [, , sdkArg, tagArg, file] = process.argv;

if (!sdkArg || !tagArg || !file) {
  console.error("usage: node bump-sdk-version.mjs <ios|android> <latestTag> <file>");
  process.exit(1);
}

const sdk = sdkArg.toLowerCase();
if (sdk !== "ios" && sdk !== "android") {
  console.error(`unknown sdk "${sdkArg}" (expected "ios" or "android")`);
  process.exit(1);
}

// Normalize "v3.37.1" / "3.37.1" -> [3, 37, 1]
const parse = (raw) => {
  const m = String(raw).trim().replace(/^v/i, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) throw new Error(`cannot parse version from "${raw}"`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};

const [major, minor, patch] = parse(tagArg);
const newV = `${major}.${minor}.${patch}`;

const original = readFileSync(file, "utf8");
let updated = original;
let current;

if (sdk === "ios") {
  // Current version comes from the CocoaPods RadarSDK line.
  const cur = original.match(/pod 'RadarSDK', '~> (\d+\.\d+\.\d+)'/);
  if (!cur) throw new Error(`no 'pod 'RadarSDK', '~> X.Y.Z'' reference found in ${file}`);
  current = cur[1];

  const nextMinor = `${major}.${minor + 1}.0`;

  updated = updated
    // CocoaPods: pod 'RadarSDK' and pod 'RadarSDKMotion' (versioned in lockstep)
    .replace(/(pod '(?:RadarSDK|RadarSDKMotion)', '~> )\d+\.\d+\.\d+(')/g, `$1${newV}$2`)
    // Carthage
    .replace(/(github "radarlabs\/radar-sdk-ios" ~> )\d+\.\d+\.\d+/g, `$1${newV}`)
    // Swift Package Manager pinned range: "X.Y.Z"..<"X.(Y+1).0"
    .replace(
      /(radar-sdk-ios-spm\.git", ")\d+\.\d+\.\d+("\.\.<")\d+\.\d+\.\d+(")/g,
      `$1${newV}$2${nextMinor}$3`
    );
} else {
  // Android pins the minor with a ".+" wildcard: io.radar:sdk:X.Y.+
  const cur = original.match(/implementation 'io\.radar:sdk:(\d+)\.(\d+)\.\+'/);
  if (!cur) throw new Error(`no 'io.radar:sdk:X.Y.+' reference found in ${file}`);
  current = `${cur[1]}.${cur[2]}.+`;

  updated = updated.replace(
    /(implementation 'io\.radar:sdk:)\d+\.\d+\.\+(')/g,
    `$1${major}.${minor}.+$2`
  );
}

// Decide whether this is actually a bump.
// iOS pins the exact patch, so compare full major.minor.patch.
// Android's ".+" already absorbs new patches, so only bump on a new minor.
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const curParts = parse(current.replace(/\+$/, "0"));
const latestParts = [major, minor, patch];
const isNewer =
  sdk === "ios"
    ? cmp(latestParts, curParts) > 0
    : cmp([latestParts[0], latestParts[1], 0], [curParts[0], curParts[1], 0]) > 0;

const changed = isNewer && updated !== original;

if (changed) {
  writeFileSync(file, updated);
  console.error(`Updated ${file}: ${current} -> ${newV}`);
} else {
  console.error(`No change for ${file} (docs: ${current}, latest: ${newV})`);
}

process.stdout.write(`changed=${changed}\n`);
process.stdout.write(`version=${newV}\n`);
process.stdout.write(`current=${current}\n`);
