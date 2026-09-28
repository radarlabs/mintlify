---
name: bump-ios-docs-version
description: Bump the Radar iOS SDK version in the docs' install snippets (CocoaPods, SPM, Carthage, RadarSDKMotion), then branch off main, commit, push, and open a draft PR. Use when the user says "bump iOS to 3.42.0", "update the iOS SDK version in the docs", or similar.
argument-hint: [version, e.g. 3.42.0]
---

# Bump the iOS SDK version in the docs

## 1. Get the target version

If the user passed a version as the argument, use it. Otherwise:

```bash
grep -n "pod 'RadarSDK', '~>" sdk/ios.mdx
gh release view --repo radarlabs/radar-sdk-ios --json tagName -q .tagName
```

Ask with AskUserQuestion. Show the current pin in the question, make "Latest stable (X.Y.Z)" the first option, and let the user pick Other to enter a custom version.

The version must be a plain stable `MAJOR.MINOR.PATCH` (strip a leading `v`). Refuse prereleases like `3.43.0-beta.1`. If it matches the current pin, say so and stop.

## 2. Check the source of truth

Read the `if (ios)` block in `.github/scripts/bump-sdk-versions.mjs`. It defines which lines are canonical install pins. The list in step 4 mirrors it. If they disagree, follow the script and tell the user.

## 3. Keep the git state safe

```bash
git status
git branch --show-current
```

If there are uncommitted changes, record the current branch and stash them:

```bash
git stash push -u -m "wip before iOS <version> docs bump"
```

Branch off the latest `main`. Take the prefix from the user's existing branches (for example `stevepopovich/`):

```bash
git fetch origin main
git checkout -b <prefix>/bump-ios-version-<x-y-z> origin/main
```

## 4. Apply the edits

Let `V` be the new version and `NEXT` be `MAJOR.(MINOR+1).0`.

| File | Pin |
|---|---|
| `sdk/ios.mdx` | `pod 'RadarSDK', '~> V'` |
| `sdk/ios.mdx` | `pod 'RadarSDKMotion', '~> V'` (moves in lockstep with RadarSDK) |
| `sdk/ios.mdx` | `github "radarlabs/radar-sdk-ios" ~> V` |
| `sdk/ios.mdx` | `.package(url: "https://github.com/radarlabs/radar-sdk-ios-spm.git", "V"..<"NEXT")` |
| `geofencing/fraud.mdx` | `.package(url: "https://github.com/radarlabs/radar-sdk-ios-spm.git", "V"..<"NEXT")` |
| `tutorials/building-a-delivery-tracking-app.mdx` | `pod 'RadarSDK', '~> V'` |

Leave these alone:

- The `radar-sdk-ios-fraud-spm` line in `geofencing/fraud.mdx`. It's a separate package with its own version.
- Prose mentions like "version 3.26.0 or higher" or "requires iOS SDK v3.19.6". They record when a feature shipped.
- `flutter_radar` versions.

## 5. Verify

```bash
grep -rn "RadarSDK', '~>\|RadarSDKMotion', '~>\|radar-sdk-ios\" ~>\|radar-sdk-ios-spm\.git\"\|radar-sdk-ios-fraud-spm\.git\"" sdk geofencing tutorials
```

Expect six core pins at `V` (SPM ranges ending at `NEXT`) and the fraud-spm line unchanged. `git diff --stat` should show only the three files above.

## 6. Commit, push, open a draft PR

Stage the three files by name. Commit with `Bump iOS SDK to V in docs` and a short body naming the pins that changed. Then:

```bash
git push -u origin <branch>
gh pr create --draft --title "Bump iOS SDK to V" --body "..."
```

In the PR body, list the pins that changed and what was left alone. Add a test-plan checkbox asking the reviewer to confirm V against the [iOS releases page](https://github.com/radarlabs/radar-sdk-ios/releases).

## 7. Clean up

If you stashed in step 3, check out the original branch and run `git stash pop`. Report the PR link.
