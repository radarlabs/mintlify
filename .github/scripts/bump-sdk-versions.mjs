// Rewrites the Radar SDK versions referenced in the docs' canonical install
// snippets to the latest STABLE release of each open-source SDK.
//
// Usage: node .github/scripts/bump-sdk-versions.mjs
//
// Reads each repo's latest stable release from the GitHub API (GitHub's
// releases/latest excludes prereleases, so betas never leak in — do NOT use
// Maven/pub "latest", which can return betas). Then does a targeted,
// pattern-based find/replace of the version strings inside the specific
// install-snippet syntaxes, scoped to the files that contain them.
//
// Writes the workflow output `changed=true|false` directly to the file named by
// $GITHUB_OUTPUT (when running under Actions). Status goes to stdout; warnings
// go to stderr.
//
// Deliberately NOT touched:
//   - Prose version mentions ("version 3.25.0 or higher").
//   - Third-party deps (play-services-location, Firebase, MapLibre, ...).
//   - The Flutter page's Android pin — coupled to the flutter_radar package's
//     bundled native version, not the core release; manually maintained.
//   - The Android fraud plugin (io.radar:sdk-fraud), the web fraud plugin
//     (js.radar.com/fraud/...), and the maps/autocomplete web plugins — their
//     source repos aren't public, so there's no reliable version to read;
//     manually maintained.
// A repo that can't be read (private/404/rate-limited) is skipped with a
// warning rather than failing the whole run.

import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

// "v3.37.1" / "3.37.1" -> [3, 37, 1]
const parse = (raw) => {
  const m = String(raw).trim().replace(/^v/i, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) throw new Error(`cannot parse a version from "${raw}"`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};
const full = ([a, b, c]) => `${a}.${b}.${c}`;
const nextMinor = ([a, b]) => `${a}.${b + 1}.0`;

// Latest STABLE release tag for a repo (releases/latest never points at a
// prerelease/draft). Returns parsed [major, minor, patch], or null on failure.
const latestStable = async (repo) => {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "radar-docs-version-bump",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const { tag_name } = await res.json();
    return parse(tag_name);
  } catch (e) {
    console.error(`WARN: could not read latest release of ${repo} (${e.message}); skipping it.`);
    return null;
  }
};

// A published release can briefly precede its CDN deploy; confirm the CDN
// actually serves a URL before pointing the docs at it.
const cdnServes = async (url) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
};

// --- Fetch latest stable releases (each independent; failures are skipped) ---
const [ios, android, iosFraud, flutter, webjs] = await Promise.all([
  latestStable("radarlabs/radar-sdk-ios"),
  latestStable("radarlabs/radar-sdk-android"),
  latestStable("radarlabs/radar-sdk-ios-fraud-spm"),
  latestStable("radarlabs/flutter-radar"),
  latestStable("radarlabs/radar-sdk-js"),
]);

console.log("Latest stable releases:");
if (ios) console.log(`  radar-sdk-ios            -> ${full(ios)}  (SPM range <${nextMinor(ios)})`);
if (android) console.log(`  radar-sdk-android        -> ${android[0]}.${android[1]}.+`);
if (iosFraud) console.log(`  radar-sdk-ios-fraud-spm  -> ${full(iosFraud)}  (SPM range <${nextMinor(iosFraud)})`);
if (flutter) console.log(`  flutter-radar            -> ${full(flutter)}`);
if (webjs) console.log(`  radar-sdk-js             -> ${full(webjs)}`);

// --- Replacement rules (only built for SDKs we could read) ------------------
const rules = [];

if (ios) {
  // CocoaPods: RadarSDK and RadarSDKMotion are versioned in lockstep.
  rules.push({
    label: "iOS CocoaPods (RadarSDK + RadarSDKMotion)",
    files: ["sdk/ios.mdx", "tutorials/building-a-delivery-tracking-app.mdx"],
    re: /(pod '(?:RadarSDKMotion|RadarSDK)', '~> )\d+\.\d+\.\d+(')/g,
    to: `$1${full(ios)}$2`,
  });
  rules.push({
    label: "iOS Carthage",
    files: ["sdk/ios.mdx"],
    re: /(github "radarlabs\/radar-sdk-ios" ~> )\d+\.\d+\.\d+/g,
    to: `$1${full(ios)}`,
  });
  // SPM pins a range: "X.Y.Z"..<"X.(Y+1).0"
  rules.push({
    label: "iOS Swift Package Manager range",
    files: ["sdk/ios.mdx", "geofencing/fraud.mdx"],
    re: /(radar-sdk-ios-spm\.git", ")\d+\.\d+\.\d+("\.\.<")\d+\.\d+\.\d+(")/g,
    to: `$1${full(ios)}$2${nextMinor(ios)}$3`,
  });
}

if (android) {
  // Android pins the minor with a ".+" wildcard so new patches are absorbed.
  rules.push({
    label: "Android Gradle (io.radar:sdk minor pin)",
    files: ["sdk/android.mdx", "geofencing/fraud.mdx"],
    re: /(implementation 'io\.radar:sdk:)\d+\.\d+\.\+(')/g,
    to: `$1${android[0]}.${android[1]}.+$2`,
  });
}

if (iosFraud) {
  rules.push({
    label: "iOS fraud plugin SPM range",
    files: ["geofencing/fraud.mdx"],
    re: /(radar-sdk-ios-fraud-spm\.git", ")\d+\.\d+\.\d+("\.\.<")\d+\.\d+\.\d+(")/g,
    to: `$1${full(iosFraud)}$2${nextMinor(iosFraud)}$3`,
  });
}

if (flutter) {
  rules.push({
    label: "Flutter pubspec (flutter_radar)",
    files: ["sdk/flutter.mdx", "tutorials/displaying-radar-maps-with-flutter.mdx"],
    re: /(flutter_radar: \^)\d+\.\d+\.\d+/g,
    to: `$1${full(flutter)}`,
  });
}

if (webjs) {
  // Core web SDK <script> tag: https://js.radar.com/vX.Y.Z/radar.min.js
  // (This does NOT match the maps/autocomplete/fraud plugin URLs, which live
  // under /maps/, /autocomplete/, /fraud/ and are versioned separately.)
  const url = `https://js.radar.com/v${full(webjs)}/radar.min.js`;
  if (await cdnServes(url)) {
    rules.push({
      label: "Web SDK CDN <script> tag",
      files: [
        "sdk/web.mdx",
        "geofencing/fraud.mdx",
        "maps/maps.mdx",
        "maps/autocomplete.mdx",
        "tutorials/building-a-web-store-locator.mdx",
        "tutorials/building-an-on-premise-mode.mdx",
        "tutorials/localizing-a-website-based-on-current-country-or-city.mdx",
      ],
      re: /(js\.radar\.com\/v)\d+\.\d+\.\d+(\/radar\.min\.js)/g,
      to: `$1${full(webjs)}$2`,
    });
  } else {
    console.error(`WARN: ${url} not served by the CDN yet; leaving web SDK tags unchanged.`);
  }
}

// Group rules by file so each file is read/written once.
const byFile = new Map();
for (const rule of rules) {
  for (const file of rule.files) {
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(rule);
  }
}

let changed = false;
for (const [file, fileRules] of byFile) {
  const before = readFileSync(file, "utf8");
  let after = before;
  for (const { label, re, to } of fileRules) {
    const next = after.replace(re, to);
    if (next !== after) console.log(`  ${file}: applied "${label}"`);
    after = next;
  }
  if (after !== before) {
    writeFileSync(file, after);
    changed = true;
  }
}

console.log(changed ? "Docs updated." : "No changes — docs already current.");

// Emit the workflow output. Under Actions, append to the $GITHUB_OUTPUT file so
// stdout is free for status logging; locally, just print it.
const output = `changed=${changed}\n`;
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, output);
} else {
  process.stdout.write(output);
}
