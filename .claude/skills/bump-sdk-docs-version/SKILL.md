---
name: bump-sdk-docs-version
description: Bump the Radar iOS or Android SDK version in the docs' install snippets, then branch off main, commit, push, and open a draft PR. Asks which platform and which version. Use when the user says "bump iOS to 3.42.0", "bump the Android SDK version in the docs", "update SDK versions", or similar.
argument-hint: [ios|android] [version]
---

# Bump an SDK version in the docs

## 1. Get the platform and version

Use whatever the user passed as arguments (for example `ios 3.42.0` or `android 3.37`). Ask for anything that's missing.

**Platform.** If it wasn't given, ask with AskUserQuestion: iOS or Android.

**Version.** If it wasn't given, look up the current pin and the latest stable release for that platform:

```bash
# iOS
grep -n "pod 'RadarSDK', '~>" sdk/ios.mdx
gh release view --repo radarlabs/radar-sdk-ios --json tagName -q .tagName

# Android
grep -n "io.radar:sdk:" sdk/android.mdx
gh release view --repo radarlabs/radar-sdk-android --json tagName -q .tagName
```

Then ask with AskUserQuestion. Show the current pin in the question, make "Latest stable (X.Y.Z)" the first option, and let the user pick Other to enter a custom version.

Strip a leading `v`. Refuse prereleases like `3.43.0-beta.1`.

- **iOS** needs a full `MAJOR.MINOR.PATCH`. If it matches the current pin, say so and stop.
- **Android** accepts `MAJOR.MINOR.PATCH` or `MAJOR.MINOR`. The docs pin the minor with a wildcard (`MAJOR.MINOR.+`), so only major and minor matter. If they already match the current pin, tell the user the wildcard already picks up that patch and stop.

## 2. Check the source of truth

Read the matching block (`if (ios)` or `if (android)`) in `.github/scripts/bump-sdk-versions.mjs`. It defines which lines are canonical install pins, and the tables in step 4 mirror it. If they disagree, follow the script and tell the user.

## 3. Keep the git state safe

```bash
git status
git branch --show-current
```

If there are uncommitted changes, record the current branch and stash them:

```bash
git stash push -u -m "wip before <platform> <version> docs bump"
```

Branch off the latest `main`. Take the prefix from the user's existing branches (for example `stevepopovich/`):

```bash
git fetch origin main
git checkout -b <prefix>/bump-<platform>-version-<x-y-z> origin/main
```

## 4. Apply the edits

### iOS

Let `V` be the new version and `NEXT` be `MAJOR.(MINOR+1).0`.

| File | Pin |
|---|---|
| `sdk/ios.mdx` | `pod 'RadarSDK', '~> V'` |
| `sdk/ios.mdx` | `pod 'RadarSDKMotion', '~> V'` (moves in lockstep with RadarSDK) |
| `sdk/ios.mdx` | `github "radarlabs/radar-sdk-ios" ~> V` |
| `sdk/ios.mdx` | `.package(url: "https://github.com/radarlabs/radar-sdk-ios-spm.git", "V"..<"NEXT")` |
| `geofencing/fraud.mdx` | `.package(url: "https://github.com/radarlabs/radar-sdk-ios-spm.git", "V"..<"NEXT")` |
| `tutorials/building-a-delivery-tracking-app.mdx` | `pod 'RadarSDK', '~> V'` |

Leave the `radar-sdk-ios-fraud-spm` line in `geofencing/fraud.mdx` alone. It's a separate package with its own version.

### Android

Let `M` be `MAJOR.MINOR`.

| File | Pin |
|---|---|
| `sdk/android.mdx` | `implementation 'io.radar:sdk:M.+'` |
| `geofencing/fraud.mdx` | `implementation 'io.radar:sdk:M.+'` |

Leave these alone:

- The Android pin in `sdk/flutter.mdx`. It has to match the native version that `flutter_radar` bundles, not the latest Android release, so it's maintained by hand.
- `io.radar:sdk-fraud`. It's a separate plugin with its own version.
- `play-services-location` and other third-party dependencies.

### Both platforms

Don't change prose mentions like "version 3.26.0 or higher" or "requires iOS SDK v3.19.6". They record when a feature shipped.

## 5. Verify

```bash
# iOS: expect six pins at V (SPM ranges ending at NEXT), fraud-spm line unchanged
grep -rn "RadarSDK', '~>\|RadarSDKMotion', '~>\|radar-sdk-ios\" ~>\|radar-sdk-ios-spm\.git\"\|radar-sdk-ios-fraud-spm\.git\"" sdk geofencing tutorials

# Android: expect both pins at M.+, sdk-fraud and the Flutter pin unchanged
grep -rn "io\.radar:sdk" sdk geofencing
```

`git diff --stat` should show only the files in the platform's table.

## 6. Commit, push, open a draft PR

Stage the edited files by name. Commit with `Bump <iOS|Android> SDK to <version> in docs` and a short body naming the pins that changed. Then:

```bash
git push -u origin <branch>
gh pr create --draft --title "Bump <iOS|Android> SDK to <version>" --body "..."
```

In the PR body, list the pins that changed and what was left alone. Add a test-plan checkbox asking the reviewer to confirm the version against the platform's releases page ([iOS](https://github.com/radarlabs/radar-sdk-ios/releases), [Android](https://github.com/radarlabs/radar-sdk-android/releases)).

## 7. Clean up

If you stashed in step 3, check out the original branch and run `git stash pop`. Report the PR link.
