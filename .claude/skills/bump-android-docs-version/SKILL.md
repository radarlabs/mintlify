---
name: bump-android-docs-version
description: Bump the Radar Android SDK version in the docs' Gradle install snippets (io.radar:sdk), then branch off main, commit, push, and open a draft PR. Use when the user says "bump Android to 3.37.0", "update the Android SDK version in the docs", or similar.
argument-hint: [version, e.g. 3.37.0]
---

# Bump the Android SDK version in the docs

## 1. Get the target version

If the user passed a version as the argument, use it. Otherwise:

```bash
grep -n "io.radar:sdk:" sdk/android.mdx
gh release view --repo radarlabs/radar-sdk-android --json tagName -q .tagName
```

Ask with AskUserQuestion. Show the current pin in the question, make "Latest stable (X.Y.Z)" the first option, and let the user pick Other to enter a custom version.

Accept `MAJOR.MINOR.PATCH` or `MAJOR.MINOR` (strip a leading `v`). Refuse prereleases like `3.38.0-beta.1`. The docs pin the minor with a wildcard (`MAJOR.MINOR.+`), so only major and minor matter. If they already match the current pin, tell the user the wildcard already picks up that patch and stop.

## 2. Check the source of truth

Read the `if (android)` block in `.github/scripts/bump-sdk-versions.mjs`. It defines which lines are canonical install pins. The list in step 4 mirrors it. If they disagree, follow the script and tell the user.

## 3. Keep the git state safe

```bash
git status
git branch --show-current
```

If there are uncommitted changes, record the current branch and stash them:

```bash
git stash push -u -m "wip before Android <version> docs bump"
```

Branch off the latest `main`. Take the prefix from the user's existing branches (for example `stevepopovich/`):

```bash
git fetch origin main
git checkout -b <prefix>/bump-android-version-<x-y-z> origin/main
```

## 4. Apply the edits

Let `M` be `MAJOR.MINOR`.

| File | Pin |
|---|---|
| `sdk/android.mdx` | `implementation 'io.radar:sdk:M.+'` |
| `geofencing/fraud.mdx` | `implementation 'io.radar:sdk:M.+'` |

Leave these alone:

- The Android pin in `sdk/flutter.mdx`. It has to match the native version that `flutter_radar` bundles, not the latest Android release, so it's maintained by hand.
- `io.radar:sdk-fraud`. It's a separate plugin with its own version.
- `play-services-location` and other third-party dependencies.
- Prose mentions like "version 3.25.0 or higher" or "deprecated in Android SDK 3.4.1". They record when something shipped.

## 5. Verify

```bash
grep -rn "io\.radar:sdk" sdk geofencing
```

Expect both core pins at `M.+`, with `sdk-fraud` and the Flutter pin unchanged. `git diff --stat` should show only the two files above.

## 6. Commit, push, open a draft PR

Stage the two files by name. Commit with `Bump Android SDK to <version> in docs` and a short body naming the pins that changed. Then:

```bash
git push -u origin <branch>
gh pr create --draft --title "Bump Android SDK to <version>" --body "..."
```

In the PR body, list the pins that changed and what was left alone. Add a test-plan checkbox asking the reviewer to confirm the version against the [Android releases page](https://github.com/radarlabs/radar-sdk-android/releases).

## 7. Clean up

If you stashed in step 3, check out the original branch and run `git stash pop`. Report the PR link.
